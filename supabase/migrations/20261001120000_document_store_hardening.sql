-- Document store hardening (forward migration over 20260930120000, which is
-- already applied in production). From the 2026-10-01 independent audit:
--
--  1. Concurrent inserts. The original RPC locked only EXISTING rows, so two
--     batches inserting the same new id both saw "absent" (the loser got a raw
--     23505), and two inserts of different ids could compute the same `ord`.
--     Every batch now takes a transaction-scoped advisory lock per
--     (workspace, collection) it touches -- in sorted order, so two batches
--     can never deadlock -- BEFORE reading anything. Writers to one collection
--     are therefore serialized: `ord` is allocated deterministically, and a
--     same-id race becomes an ordinary stale_write the client re-reads on.
--
--  2. "Initialized but empty" vs "never seeded". workspaces.migrated_at now
--     records that the document store has been populated (set on the first
--     put, backfilled below). fm_read_document_status exposes it with the
--     document count, so a client can tell a deliberately emptied workspace
--     from an unseeded one, and can prove a paginated read is complete.

DO $$ BEGIN
  EXECUTE format('GRANT fm_table_owner, fm_public_reader, fm_member_api TO %I', current_user);
END $$;
GRANT CREATE ON SCHEMA public TO fm_public_reader, fm_member_api;

-- Backfill: a workspace that already holds documents is initialized.
DO $$
DECLARE v_role text := current_user;
BEGIN
  EXECUTE 'SET LOCAL ROLE fm_table_owner';
  UPDATE app_private.workspaces w SET migrated_at = now()
   WHERE w.migrated_at IS NULL
     AND EXISTS (SELECT 1 FROM app_private.documents d WHERE d.workspace_id = w.id);
  EXECUTE format('SET LOCAL ROLE %I', v_role);
END $$;

-- Readable by anyone for a public workspace, and by members for their own.
CREATE FUNCTION public.fm_read_document_status(p_slug text)
RETURNS TABLE (initialized boolean, document_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT w.migrated_at IS NOT NULL,
         (SELECT count(*) FROM app_private.documents d WHERE d.workspace_id = w.id)
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
  v_expected bigint;
  v_current bigint;
  v_ord double precision;
  v_lock text;
  v_any_put boolean := false;
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
      v_any_put := true;
    ELSIF v_kind = 'delete' THEN
      v_id := v_op->>'id';
      IF v_id IS NULL THEN
        RAISE EXCEPTION 'delete requires an id' USING ERRCODE = '22023';
      END IF;
    ELSE
      RAISE EXCEPTION 'unknown op %', coalesce(v_kind, '<null>') USING ERRCODE = '22023';
    END IF;

    SELECT d.revision INTO v_current
      FROM app_private.documents d
     WHERE d.workspace_id = v_ws AND d.collection = v_coll AND d.id = v_id
       FOR UPDATE;

    IF v_expected IS NOT NULL AND v_expected <> coalesce(v_current, 0) THEN
      PERFORM app_private.raise_stale_write(coalesce(v_current, 0));
    END IF;

    IF v_kind = 'delete' THEN
      IF v_current IS NOT NULL THEN
        DELETE FROM app_private.documents d
         WHERE d.workspace_id = v_ws AND d.collection = v_coll AND d.id = v_id;
      END IF;
      collection := v_coll; id := v_id; revision := NULL; deleted := true;
      RETURN NEXT;
    ELSIF v_current IS NULL THEN
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

  -- First population marks the workspace initialized. Owner-only by the
  -- workspaces RLS policy; for an editor this updates zero rows, harmlessly.
  IF v_any_put THEN
    UPDATE app_private.workspaces w SET migrated_at = now()
     WHERE w.id = v_ws AND w.migrated_at IS NULL;
  END IF;
END $$;

ALTER FUNCTION public.fm_read_document_status(text) OWNER TO fm_public_reader;
ALTER FUNCTION public.fm_rpc_apply_documents(text, json) OWNER TO fm_member_api;
REVOKE ALL ON FUNCTION public.fm_read_document_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fm_read_document_status(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.fm_rpc_apply_documents(text, json) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fm_rpc_apply_documents(text, json) TO authenticated;

REVOKE CREATE ON SCHEMA public FROM fm_public_reader, fm_member_api;
DO $$ BEGIN
  EXECUTE format('REVOKE fm_table_owner, fm_public_reader, fm_member_api FROM %I', current_user);
END $$;
