// Document store — the React half.
//
// One hook owns the four collections App renders. Modes:
//
//   local     Supabase unconfigured. Bundled data, edits stay in this tab —
//             exactly the pre-persistence behaviour.
//   loading   configured, first read in flight. Bundled data shown read-only.
//   live      server is the source of truth. Writes are CONFIRMED-ONLY: local
//             state changes strictly after fm_rpc_apply_documents returns.
//   unseeded  the workspace was never populated. Bundled data, read-only.
//             (A workspace that WAS populated and is now empty is live and
//             empty -- the server's `initialized` flag tells them apart.)
//   offline   the read failed. Bundled data, read-only, retried on focus.
//
// Every write carries the revision it was based on, so a change made on
// another device is a conflict (re-read and redo), never a silent overwrite.
// A write whose outcome is UNKNOWN (network or server failure: it may or may
// not have landed) is kept and RE-SENT VERBATIM -- same ids, same payloads --
// before anything else is written. The server treats an op whose effect is
// already in place as a no-op success (migration 20261002120000), and its
// per-collection lock makes a replay wait for an original still in flight, so
// an unconfirmed write lands exactly once however many times it is retried.
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

// Failures that do NOT prove the write was rejected.
const isAmbiguous = (error) => !['conflict', 'unauthenticated', 'forbidden', 'validation', 'notFound']
  .includes(error?.kind);

function describeError(error) {
  switch (error?.kind) {
    case 'offline': return 'Connection lost — your save will be confirmed automatically before your next change.';
    case 'unauthenticated': return 'Signed out — sign in again to save.';
    case 'forbidden': return 'Your account cannot edit this workspace.';
    case 'conflict': return 'Changed on another device — reloaded. Redo your change.';
    case 'validation': return 'The server rejected this change.';
    default: return 'Couldn’t confirm the save — it will be retried automatically before your next change.';
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
  // A background refresh failed while live: the screen may be out of date.
  const [refreshFailed, setRefreshFailed] = useState(false);

  const revisionsRef = useRef({});
  const collectionsRef = useRef(bundled);
  const lastLoadRef = useRef(0);
  const loadSeqRef = useRef(0);
  const savingRef = useRef(false);
  const savedTimerRef = useRef(null);
  // The one write whose outcome is unknown: { sent, ops }. See runCommit.
  const pendingRef = useRef(null);
  // Latest values for the queued writer, which runs after the render that
  // enqueued it and must not act on a stale closure.
  const liveRef = useRef({});
  liveRef.current = { mode, surface, canWrite: auth.canWrite, signedIn: Boolean(auth.session) };

  const setBoth = useCallback((next) => {
    collectionsRef.current = next;
    setCollections(next);
  }, []);

  /** Resolves true when the screen now reflects the server. */
  const reload = useCallback(async () => {
    if (!documents) return false;
    const seq = ++loadSeqRef.current;
    lastLoadRef.current = Date.now();
    const result = await documents.load({ member });
    const loadedSurface = member ? 'member' : 'public';
    if (seq !== loadSeqRef.current) return false; // a newer load superseded this one
    if (!result.ok) {
      // Keep whatever is on screen (flagged as possibly stale when live);
      // only fall back to bundled on first load.
      if (liveRef.current.mode === STORE_MODES.LIVE) setRefreshFailed(true);
      else setMode(STORE_MODES.OFFLINE);
      return false;
    }
    setRefreshFailed(false);
    if (!result.data.initialized && isEmpty(result.data.collections)) {
      revisionsRef.current = {};
      setBoth(bundled);
      setMode(STORE_MODES.UNSEEDED);
      return true;
    }
    revisionsRef.current = result.data.revisions;
    setBoth(result.data.collections);
    setSurface(loadedSurface);
    setMode(STORE_MODES.LIVE);
    return true;
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
      // An unconfirmed write is confirmed first (an empty commit replays it).
      if (pendingRef.current) { commitRef.current?.(() => []); return; }
      if (Date.now() - lastLoadRef.current < REFRESH_ON_FOCUS_AFTER_MS) return;
      reload();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [documents, reload]);

  useEffect(() => () => clearTimeout(savedTimerRef.current), []);

  const canWrite = mode === STORE_MODES.LOCAL || (mode === STORE_MODES.LIVE && auth.canWrite);

  const queueRef = useRef(Promise.resolve());

  /** A confirmed write: fold revisions, show it, discard stale reads. */
  const settle = useCallback((ops, result) => {
    // Any read still in flight started before this write landed; its result
    // would roll the screen and the revisions back, so it is discarded.
    loadSeqRef.current += 1;
    revisionsRef.current = applyResultRevisions(revisionsRef.current, result.data);
    setBoth(applyOpsLocally(collectionsRef.current, ops));
    clearTimeout(savedTimerRef.current);
    setSaveState({ status: 'saved', message: null });
    savedTimerRef.current = setTimeout(() => setSaveState({ status: 'idle', message: null }), SAVED_BADGE_MS);
  }, [setBoth]);

  /**
   * Re-send the unconfirmed write exactly as first sent. 'ok' (it is in place
   * now, whether this send or the original put it there), 'rejected' (the
   * server definitively refused it), or 'unknown' (still unreachable).
   */
  const replayPending = useCallback(async () => {
    const pending = pendingRef.current;
    savingRef.current = true;
    const result = await documents.apply(pending.sent);
    savingRef.current = false;
    if (result.ok) {
      pendingRef.current = null;
      settle(pending.ops, result);
      return 'ok';
    }
    if (isAmbiguous(result.error)) return 'unknown';
    pendingRef.current = null;
    setSaveState({ status: 'failed', message: describeError(result.error) });
    await reload();
    return 'rejected';
  }, [documents, reload, settle]);

  const runCommit = useCallback(async (opsOrFn) => {
    // Nothing new is written while an earlier write is unconfirmed: confirm
    // it first (by replaying it), or a retry of something that DID land, or
    // is still landing, would duplicate it.
    if (pendingRef.current) {
      const outcome = await replayPending();
      if (outcome === 'unknown') {
        setSaveState({ status: 'failed', message: 'Still can’t reach the server — your last save isn’t confirmed yet, so nothing new was saved.' });
        return false;
      }
    }
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
    const sent = withExpectedRevisions(ops, revisionsRef.current);
    const result = await documents.apply(sent);
    savingRef.current = false;
    if (result.ok) {
      settle(ops, result);
      return true;
    }
    if (isAmbiguous(result.error)) {
      // Unknown outcome: keep it, and try once more straight away (a brief
      // blip resolves here, invisibly). Still unknown -> it is replayed
      // before the next write, and on focus.
      pendingRef.current = { sent, ops };
      const outcome = await replayPending();
      if (outcome === 'ok') return true;
      if (outcome === 'unknown') setSaveState({ status: 'failed', message: describeError(result.error) });
      return false;
    }
    setSaveState({ status: 'failed', message: describeError(result.error) });
    if (result.error?.kind === 'conflict') await reload();
    return false;
  }, [documents, reload, replayPending, settle]);

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
  const commitRef = useRef(null);
  commitRef.current = commit;

  const dismiss = useCallback(() => setSaveState({ status: 'idle', message: null }), []);

  return useMemo(() => ({
    collections, mode, saveState, canWrite, refreshFailed, commit, reload, dismiss,
  }), [collections, mode, saveState, canWrite, refreshFailed, commit, reload, dismiss]);
}
