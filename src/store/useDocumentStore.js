// Document store — the React half.
//
// One hook owns the four collections App renders. Modes:
//
//   local     Supabase unconfigured. Bundled data, edits stay in this tab —
//             exactly the pre-persistence behaviour.
//   loading   configured, first read in flight. Bundled data shown read-only.
//   live      server is the source of truth. Writes are CONFIRMED-ONLY: local
//             state changes strictly after fm_rpc_apply_documents returns.
//   unseeded  the workspace has no documents yet. Bundled data, read-only.
//   offline   the read failed. Bundled data, read-only, retried on focus.
//
// Every write carries the revision it was based on, so a change made on
// another device is a conflict (re-read and redo), never a silent overwrite.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import {
  applyOpsLocally, applyResultRevisions, withExpectedRevisions,
} from '../data/documents/collections.mjs';

export const STORE_MODES = Object.freeze({
  LOCAL: 'local', LOADING: 'loading', LIVE: 'live', UNSEEDED: 'unseeded', OFFLINE: 'offline',
});

const REFRESH_ON_FOCUS_AFTER_MS = 30_000;
const SAVED_BADGE_MS = 2_500;

const isEmpty = (c) => !c.upcoming.length && !c.roi.length && !c.propPicks.length && !c.parlays.length;

function describeError(error) {
  switch (error?.kind) {
    case 'offline': return 'Offline — not saved.';
    case 'unauthenticated': return 'Signed out — sign in again to save.';
    case 'forbidden': return 'Your account cannot edit this workspace.';
    case 'conflict': return 'Changed on another device — reloaded. Redo your change.';
    default: return 'Save failed — try again.';
  }
}

/**
 * `bundled` is `{ upcoming, roi, propPicks, parlays }` from the bundled data
 * files: the local-mode dataset and the fallback for every non-live mode.
 */
export function useDocumentStore(bundled) {
  const auth = useAuth();
  const documents = auth.documents;
  const member = auth.readSurface === 'member';

  const [mode, setMode] = useState(documents ? STORE_MODES.LOADING : STORE_MODES.LOCAL);
  const [collections, setCollections] = useState(bundled);
  const [saveState, setSaveState] = useState({ status: 'idle', message: null });
  // Which surface the on-screen data came from. Writes need the member
  // surface, because only it carries revision tokens.
  const [surface, setSurface] = useState(null);

  const revisionsRef = useRef({});
  const collectionsRef = useRef(bundled);
  const lastLoadRef = useRef(0);
  const loadSeqRef = useRef(0);
  const savingRef = useRef(false);
  const savedTimerRef = useRef(null);

  const setBoth = useCallback((next) => {
    collectionsRef.current = next;
    setCollections(next);
  }, []);

  const reload = useCallback(async () => {
    if (!documents) return;
    const seq = ++loadSeqRef.current;
    lastLoadRef.current = Date.now();
    const result = await documents.load({ member });
    const loadedSurface = member ? 'member' : 'public';
    if (seq !== loadSeqRef.current) return; // a newer load superseded this one
    if (!result.ok) {
      // Keep whatever is on screen; only fall back to bundled on first load.
      setMode((m) => (m === STORE_MODES.LIVE ? m : STORE_MODES.OFFLINE));
      return;
    }
    if (isEmpty(result.data.collections)) {
      revisionsRef.current = {};
      setBoth(bundled);
      setMode(STORE_MODES.UNSEEDED);
      return;
    }
    revisionsRef.current = result.data.revisions;
    setBoth(result.data.collections);
    setSurface(loadedSurface);
    setMode(STORE_MODES.LIVE);
  }, [documents, member, bundled, setBoth]);

  // The public copy loads IMMEDIATELY, without waiting for auth, so the server
  // data replaces the bundled snapshot as fast as possible. Once membership
  // resolves to a member, the member copy (with revision tokens) replaces it;
  // a sign-out switches back. `member` is false until auth resolves, so the
  // first run is always the public read.
  const loadedForRef = useRef(null);
  useEffect(() => {
    if (!documents) return;
    const want = member ? 'member' : 'public';
    if (loadedForRef.current === want) return;
    loadedForRef.current = want;
    reload();
  }, [documents, member, reload]);

  // Cross-device freshness: re-read on focus, at most every 30 s.
  useEffect(() => {
    if (!documents || typeof window === 'undefined') return undefined;
    const onFocus = () => {
      if (savingRef.current) return;
      if (Date.now() - lastLoadRef.current < REFRESH_ON_FOCUS_AFTER_MS) return;
      reload();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [documents, reload]);

  useEffect(() => () => clearTimeout(savedTimerRef.current), []);

  const canWrite = mode === STORE_MODES.LOCAL || (mode === STORE_MODES.LIVE && auth.canWrite);

  // Latest values for the queued writer, which runs after the render that
  // enqueued it and must not act on a stale closure.
  const liveRef = useRef({});
  liveRef.current = { mode, surface, canWrite: auth.canWrite, signedIn: Boolean(auth.session) };
  const queueRef = useRef(Promise.resolve());

  const runCommit = useCallback(async (opsOrFn) => {
    const ops = typeof opsOrFn === 'function' ? opsOrFn(collectionsRef.current) : opsOrFn;
    if (!ops?.length) return true;
    const live = liveRef.current;
    if (live.mode !== STORE_MODES.LIVE) {
      setSaveState({ status: 'failed', message: 'Not connected — change not saved.' });
      return false;
    }
    if (!live.canWrite) {
      setSaveState({
        status: 'readOnly',
        message: live.signedIn ? 'Your account is read-only here.' : 'Sign in (Info tab) to save changes.',
      });
      return false;
    }
    if (live.surface !== 'member') {
      setSaveState({ status: 'failed', message: 'Still connecting — try again in a moment.' });
      return false;
    }
    clearTimeout(savedTimerRef.current);
    savingRef.current = true;
    setSaveState({ status: 'saving', message: null });
    const result = await documents.apply(withExpectedRevisions(ops, revisionsRef.current));
    savingRef.current = false;
    if (!result.ok) {
      setSaveState({ status: 'failed', message: describeError(result.error) });
      if (result.error?.kind === 'conflict') await reload();
      return false;
    }
    // Any read still in flight started before this write landed; its result
    // would roll the screen and the revisions back, so it is discarded.
    loadSeqRef.current += 1;
    revisionsRef.current = applyResultRevisions(revisionsRef.current, result.data);
    setBoth(applyOpsLocally(collectionsRef.current, ops));
    setSaveState({ status: 'saved', message: null });
    savedTimerRef.current = setTimeout(() => setSaveState({ status: 'idle', message: null }), SAVED_BADGE_MS);
    return true;
  }, [documents, reload, setBoth]);

  /**
   * Apply a batch of document ops -- or a function of the CURRENT collections
   * returning one, so an update is built from the latest saved state rather
   * than whatever was on screen when it was clicked. Writes are serialized:
   * each runs after the previous one has returned and updated the revisions,
   * so rapid edits never race each other into a self-inflicted conflict.
   *
   * Resolves true when the change is in effect (saved, or applied locally in
   * local mode), false when it was refused.
   */
  const commit = useCallback((opsOrFn) => {
    if (liveRef.current.mode === STORE_MODES.LOCAL) {
      // Synchronous, as before persistence existed: controlled inputs that
      // update per keystroke must see their own state immediately.
      const ops = typeof opsOrFn === 'function' ? opsOrFn(collectionsRef.current) : opsOrFn;
      if (ops?.length) setBoth(applyOpsLocally(collectionsRef.current, ops));
      return Promise.resolve(true);
    }
    const next = queueRef.current.then(() => runCommit(opsOrFn));
    queueRef.current = next.catch(() => false);
    return next;
  }, [runCommit, setBoth]);

  const dismiss = useCallback(() => setSaveState({ status: 'idle', message: null }), []);

  return useMemo(() => ({
    collections, mode, saveState, canWrite, commit, reload, dismiss,
  }), [collections, mode, saveState, canWrite, commit, reload, dismiss]);
}
