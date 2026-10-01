-- Stage 7 — document store.
--
-- The app's collections (Upcoming, ROI, prop picks, parlays) are stored as the
-- exact JSON objects the app already renders and edits, one row per object.
-- This replaces the normalized-aggregate runtime path: that schema cannot hold
-- the C6 decision layer or boutContext, which the live app depends on (see
-- docs/STAGE_7_PLAN.md, "Document store pivot").
--
-- Reused from 20260729190000: workspaces, workspace_members, is_member,
-- require_role, current_user_id, fm_member_whoami and
-- fm_rpc_claim_workspace_ownership. Same role model: tables owned by
-- fm_table_owner, the public read owned by fm_public_reader, member reads and
-- writes owned by fm_member_api, and no grant to anon/authenticated beyond
-- EXECUTE on the three public functions.

DO $$ BEGIN
  EXECUTE format('GRANT fm_table_owner, fm_public_reader, fm_member_api TO %I', current_user);
END $$;
GRANT CREATE ON SCHEMA public TO fm_public_reader, fm_member_api;

CREATE TABLE app_private.documents (
  workspace_id uuid NOT NULL REFERENCES app_private.workspaces(id)
                 ON UPDATE RESTRICT ON DELETE RESTRICT,
  collection   text NOT NULL
                 CHECK (collection IN ('upcoming','roi','propPicks','parlays')),
  id           text NOT NULL CHECK (length(id) BETWEEN 1 AND 200),
  -- The object itself, as `json` rather than `jsonb` ON PURPOSE: json keeps
  -- the exact text -- key order and number spelling -- so the server's copy
  -- exports byte-identical to the bundled data files. jsonb re-sorts keys.
  -- Its own `id` must be the row id, so a payload can never be filed under
  -- another entry's key.
  payload      json NOT NULL,
  -- Display order within a collection, ascending. New rows go to the top
  -- (min - 1) or bottom (max + 1); an update keeps its place.
  ord          double precision NOT NULL,
  revision     bigint NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid,
  PRIMARY KEY (workspace_id, collection, id),
  CONSTRAINT documents_payload_object CHECK (json_typeof(payload) = 'object'),
  CONSTRAINT documents_payload_id CHECK (payload->>'id' = id),
  CONSTRAINT documents_payload_size CHECK (pg_column_size(payload) <= 262144)
);
CREATE INDEX documents_order ON app_private.documents (workspace_id, collection, ord);

ALTER TABLE app_private.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_read ON app_private.documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM app_private.workspaces w
                  WHERE w.id = documents.workspace_id
                    AND (w.is_public
                         OR app_private.is_member(w.id, ARRAY['owner','editor','viewer']))));
CREATE POLICY documents_insert ON app_private.documents FOR INSERT
  WITH CHECK (app_private.is_member(workspace_id, ARRAY['owner','editor']));
CREATE POLICY documents_update ON app_private.documents FOR UPDATE
  USING (app_private.is_member(workspace_id, ARRAY['owner','editor']))
  WITH CHECK (app_private.is_member(workspace_id, ARRAY['owner','editor']));
CREATE POLICY documents_delete ON app_private.documents FOR DELETE
  USING (app_private.is_member(workspace_id, ARRAY['owner','editor']));

ALTER TABLE app_private.documents OWNER TO fm_table_owner;
REVOKE ALL ON app_private.documents FROM PUBLIC, anon, authenticated;
GRANT SELECT ON app_private.documents TO fm_public_reader, fm_member_api;
GRANT INSERT, UPDATE, DELETE ON app_private.documents TO fm_member_api;

-- The production workspace. Created here so the hosted rollout needs no
-- hand-run SQL; the first signed-in user claims it through
-- fm_rpc_claim_workspace_ownership.
SET LOCAL ROLE fm_table_owner;
INSERT INTO app_private.workspaces (slug, is_public) VALUES ('fightmetrics', true)
  ON CONFLICT (slug) DO NOTHING;
RESET ROLE;

-- ── Reads ───────────────────────────────────────────────────────────────────
-- Public: public workspaces only, no revision tokens.
CREATE FUNCTION public.fm_read_documents(p_slug text)
RETURNS TABLE (collection text, id text, payload json)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT d.collection, d.id, d.payload
    FROM app_private.documents d
    JOIN app_private.workspaces w ON w.id = d.workspace_id
   WHERE w.slug = p_slug AND w.is_public
   ORDER BY d.collection, d.ord, d.id
$$;

-- Members: any workspace they belong to, with revision tokens for writes.
CREATE FUNCTION public.fm_member_documents(p_slug text)
RETURNS TABLE (collection text, id text, payload json, revision text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT d.collection, d.id, d.payload, d.revision::text
    FROM app_private.documents d
    JOIN app_private.workspaces w ON w.id = d.workspace_id
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
   ORDER BY d.collection, d.ord, d.id
$$;

-- ── Writes ──────────────────────────────────────────────────────────────────
-- One atomic batch. Every op succeeds or the whole batch rolls back, so a grade
-- (delete from upcoming + put into roi) can never half-apply.
--
--   { "op": "put",    "collection": c, "payload": {...id...},
--     "expectedRevision": "<n>" | "0" | absent, "position": "top" | "bottom" }
--   { "op": "delete", "collection": c, "id": "...",
--     "expectedRevision": "<n>" | absent }
--
-- expectedRevision: absent = unconditional; "0" = must not exist yet; "<n>" =
-- the current revision must equal n, otherwise stale_write (P0001) carrying the
-- live revision. position applies to inserts only (default top); an update
-- keeps its place. Deleting a missing row with no expectedRevision is a no-op.
-- p_ops is `json`, not `jsonb`, so payload text reaches the table unaltered.
CREATE FUNCTION public.fm_rpc_apply_documents(p_slug text, p_ops json)
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
BEGIN
  v_ws := app_private.require_role(p_slug, ARRAY['owner','editor']);
  v_uid := app_private.current_user_id();
  IF json_typeof(p_ops) IS DISTINCT FROM 'array' OR json_array_length(p_ops) = 0 THEN
    RAISE EXCEPTION 'p_ops must be a non-empty array' USING ERRCODE = '22023';
  END IF;
  IF json_array_length(p_ops) > 1000 THEN
    RAISE EXCEPTION 'at most 1000 ops per batch' USING ERRCODE = '22023';
  END IF;

  FOR v_op IN SELECT value FROM json_array_elements(p_ops) LOOP
    v_kind := v_op->>'op';
    v_coll := v_op->>'collection';
    IF v_coll IS NULL OR v_coll NOT IN ('upcoming','roi','propPicks','parlays') THEN
      RAISE EXCEPTION 'unknown collection %', coalesce(v_coll, '<null>') USING ERRCODE = '22023';
    END IF;
    v_expected := (v_op->>'expectedRevision')::bigint;

    IF v_kind = 'put' THEN
      v_payload := v_op->'payload';
      -- Every app id is a string; a numeric id is refused rather than
      -- rewritten, because rewriting would change the stored text.
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
END $$;

ALTER FUNCTION public.fm_read_documents(text) OWNER TO fm_public_reader;
ALTER FUNCTION public.fm_member_documents(text) OWNER TO fm_member_api;
ALTER FUNCTION public.fm_rpc_apply_documents(text, json) OWNER TO fm_member_api;

REVOKE ALL ON FUNCTION public.fm_read_documents(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fm_member_documents(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fm_rpc_apply_documents(text, json) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fm_read_documents(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fm_member_documents(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fm_rpc_apply_documents(text, json) TO authenticated;

REVOKE CREATE ON SCHEMA public FROM fm_public_reader, fm_member_api;
DO $$ BEGIN
  EXECUTE format('REVOKE fm_table_owner, fm_public_reader, fm_member_api FROM %I', current_user);
END $$;
