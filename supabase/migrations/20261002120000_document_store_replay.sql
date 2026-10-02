-- Document store: idempotent replays + read generations. Forward migration over
-- 20261001120000. From the 2026-10-02 audit of PR #37:
--
--  1. Replays. A write whose response was lost may or may not have landed, and
--     the client re-sends the EXACT same ops to find out. So re-applying an op
--     whose effect is already in place is a no-op success:
--       put    -- the stored payload already equals this payload (compared as
--                 jsonb, i.e. by value); succeeds whatever expectedRevision
--                 says, because the content is exactly what was asked for;
--       delete -- the row is already gone.
--     Anything else that disagrees with expectedRevision is still stale_write.
--     With the per-collection advisory locks, a replay that races the original
--     still in flight WAITS for it, then sees it -- never a second row.
--
--  2. Generations. A grade moves a document between collections without
--     changing the total count, so a paged read spanning it could pass a
--     count check while missing that row. workspaces.document_generation is
--     bumped by every batch, under the workspace row lock, and is returned by
--     fm_read_document_status; a read is only accepted when the generation is
--     the same before and after it.

DO $$ BEGIN
  EXECUTE format('GRANT fm_table_owner, fm_public_reader, fm_member_api TO %I', current_user);
END $$;
GRANT CREATE ON SCHEMA public TO fm_public_reader, fm_member_api;

DO $$
DECLARE v_role text := current_user;
BEGIN
  EXECUTE 'SET LOCAL ROLE fm_table_owner';
  ALTER TABLE app_private.workspaces
    ADD COLUMN document_generation bigint NOT NULL DEFAULT 0
    CONSTRAINT workspaces_document_generation_nonneg CHECK (document_generation >= 0);
  EXECUTE format('SET LOCAL ROLE %I', v_role);
END $$;

-- Owned by the table owner so it is not subject to the workspaces RLS policy
-- (owner-only UPDATE): an editor's writes must bump the generation too.
-- Callable only by fm_member_api, i.e. only from inside the write RPC.
CREATE FUNCTION app_private.bump_document_generation(p_workspace uuid)
RETURNS bigint LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
  UPDATE app_private.workspaces
     SET document_generation = document_generation + 1,
         migrated_at = coalesce(migrated_at, now())
   WHERE id = p_workspace
  RETURNING document_generation
$$;

DROP FUNCTION public.fm_read_document_status(text);
CREATE FUNCTION public.fm_read_document_status(p_slug text)
RETURNS TABLE (initialized boolean, document_count bigint, generation text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT w.migrated_at IS NOT NULL,
         (SELECT count(*) FROM app_private.documents d WHERE d.workspace_id = w.id),
         w.document_generation::text
    FROM app_private.workspaces w
   WHERE w.slug = p_slug
     AND (w.is_public OR app_private.is_member(w.id, ARRAY['owner','editor','viewer']))
$$;

CREATE OR REPLACE FUNCTION public.fm_rpc_apply_documents(p_slug text, p_ops json)
RETURNS TABLE (collection text, id text, revision text, deleted boolean)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_ws uuid;
  v_uid uuid;
  v_op json;
  v_kind text;
  v_coll text;
  v_id text;
  v_payload json;
  v_stored json;
  v_expected bigint;
  v_current bigint;
  v_ord double precision;
  v_lock text;
BEGIN
  v_ws := app_private.require_role(p_slug, ARRAY['owner','editor']);
  v_uid := app_private.current_user_id();
  IF json_typeof(p_ops) IS DISTINCT FROM 'array' OR json_array_length(p_ops) = 0 THEN
    RAISE EXCEPTION 'p_ops must be a non-empty array' USING ERRCODE = '22023';
  END IF;
  IF json_array_length(p_ops) > 1000 THEN
    RAISE EXCEPTION 'at most 1000 ops per batch' USING ERRCODE = '22023';
  END IF;

  -- Serialize writers per collection, locks taken in sorted order.
  FOR v_lock IN
    SELECT DISTINCT o->>'collection' FROM json_array_elements(p_ops) AS o
     WHERE o->>'collection' IN ('upcoming','roi','propPicks','parlays')
     ORDER BY 1
  LOOP
    PERFORM pg_advisory_xact_lock(hashtextextended(v_ws::text || ':' || v_lock, 0));
  END LOOP;
  -- New read generation (and the initialized marker), under the workspace row
  -- lock, which also serializes batches across collections.
  PERFORM app_private.bump_document_generation(v_ws);

  FOR v_op IN SELECT value FROM json_array_elements(p_ops) LOOP
    v_kind := v_op->>'op';
    v_coll := v_op->>'collection';
    IF v_coll IS NULL OR v_coll NOT IN ('upcoming','roi','propPicks','parlays') THEN
      RAISE EXCEPTION 'unknown collection %', coalesce(v_coll, '<null>') USING ERRCODE = '22023';
    END IF;
    v_expected := (v_op->>'expectedRevision')::bigint;

    IF v_kind = 'put' THEN
      v_payload := v_op->'payload';
      IF v_payload IS NULL OR json_typeof(v_payload) IS DISTINCT FROM 'object'
         OR json_typeof(v_payload->'id') IS DISTINCT FROM 'string' THEN
        RAISE EXCEPTION 'put requires an object payload with a string id' USING ERRCODE = '22023';
      END IF;
      v_id := v_payload->>'id';
    ELSIF v_kind = 'delete' THEN
      v_id := v_op->>'id';
      IF v_id IS NULL THEN
        RAISE EXCEPTION 'delete requires an id' USING ERRCODE = '22023';
      END IF;
    ELSE
      RAISE EXCEPTION 'unknown op %', coalesce(v_kind, '<null>') USING ERRCODE = '22023';
    END IF;

    v_current := NULL; v_stored := NULL;
    SELECT d.revision, d.payload INTO v_current, v_stored
      FROM app_private.documents d
     WHERE d.workspace_id = v_ws AND d.collection = v_coll AND d.id = v_id
       FOR UPDATE;

    IF v_kind = 'delete' THEN
      -- Already gone: the intent is satisfied (a replay, or someone else
      -- deleted it). Otherwise the revision must match.
      IF v_current IS NOT NULL THEN
        IF v_expected IS NOT NULL AND v_expected <> v_current THEN
          PERFORM app_private.raise_stale_write(v_current);
        END IF;
        DELETE FROM app_private.documents d
         WHERE d.workspace_id = v_ws AND d.collection = v_coll AND d.id = v_id;
      END IF;
      collection := v_coll; id := v_id; revision := NULL; deleted := true;
      RETURN NEXT;
      CONTINUE;
    END IF;

    -- put: already exactly this content -> replay, no-op success.
    IF v_current IS NOT NULL AND v_stored::jsonb = v_payload::jsonb THEN
      collection := v_coll; id := v_id; revision := v_current::text; deleted := false;
      RETURN NEXT;
      CONTINUE;
    END IF;

    IF v_expected IS NOT NULL AND v_expected <> coalesce(v_current, 0) THEN
      PERFORM app_private.raise_stale_write(coalesce(v_current, 0));
    END IF;

    IF v_current IS NULL THEN
      IF coalesce(v_op->>'position', 'top') = 'bottom' THEN
        SELECT coalesce(max(d.ord), 0) + 1 INTO v_ord FROM app_private.documents d
         WHERE d.workspace_id = v_ws AND d.collection = v_coll;
      ELSE
        SELECT coalesce(min(d.ord), 0) - 1 INTO v_ord FROM app_private.documents d
         WHERE d.workspace_id = v_ws AND d.collection = v_coll;
      END IF;
      INSERT INTO app_private.documents
        (workspace_id, collection, id, payload, ord, revision, updated_by)
      VALUES (v_ws, v_coll, v_id, v_payload, v_ord, 1, v_uid);
      collection := v_coll; id := v_id; revision := '1'; deleted := false;
      RETURN NEXT;
    ELSE
      UPDATE app_private.documents d
         SET payload = v_payload, revision = d.revision + 1,
             updated_at = now(), updated_by = v_uid
       WHERE d.workspace_id = v_ws AND d.collection = v_coll AND d.id = v_id;
      collection := v_coll; id := v_id; revision := (v_current + 1)::text; deleted := false;
      RETURN NEXT;
    END IF;
  END LOOP;
END $$;

ALTER FUNCTION app_private.bump_document_generation(uuid) OWNER TO fm_table_owner;
REVOKE ALL ON FUNCTION app_private.bump_document_generation(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.bump_document_generation(uuid) TO fm_member_api;

ALTER FUNCTION public.fm_read_document_status(text) OWNER TO fm_public_reader;
REVOKE ALL ON FUNCTION public.fm_read_document_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fm_read_document_status(text) TO anon, authenticated;

ALTER FUNCTION public.fm_rpc_apply_documents(text, json) OWNER TO fm_member_api;
REVOKE ALL ON FUNCTION public.fm_rpc_apply_documents(text, json) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fm_rpc_apply_documents(text, json) TO authenticated;

REVOKE CREATE ON SCHEMA public FROM fm_public_reader, fm_member_api;
DO $$ BEGIN
  EXECUTE format('REVOKE fm_table_owner, fm_public_reader, fm_member_api FROM %I', current_user);
END $$;
