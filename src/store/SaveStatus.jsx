// The one piece of persistence UI: a small status pill.
//
// Silent in local and live-idle modes. Shows "Saving…", "Saved", or the reason
// a change was refused, and a quiet notice when the app is showing its bundled
// snapshot because the server is unreachable or not yet seeded.
import React from 'react';
import { STORE_MODES } from './useDocumentStore.js';

const TONE = {
  saving: 'border-slate-600 bg-slate-800 text-slate-200',
  saved: 'border-emerald-700 bg-emerald-950 text-emerald-200',
  failed: 'border-rose-700 bg-rose-950 text-rose-200',
  readOnly: 'border-amber-700 bg-amber-950 text-amber-200',
  notice: 'border-slate-700 bg-slate-900 text-slate-300',
};

export default function SaveStatus({ store }) {
  const { saveState, mode, refreshFailed, dismiss } = store;
  let tone = null;
  let text = null;
  let dismissible = false;

  if (saveState.status === 'saving') { tone = 'saving'; text = 'Saving…'; }
  else if (saveState.status === 'saved') { tone = 'saved'; text = 'Saved'; }
  else if (saveState.status === 'failed' || saveState.status === 'readOnly') {
    tone = saveState.status; text = saveState.message; dismissible = true;
  } else if (mode === STORE_MODES.OFFLINE) {
    tone = 'notice'; text = 'Offline — showing the last published snapshot.';
  } else if (mode === STORE_MODES.UNSEEDED) {
    tone = 'notice'; text = 'Database not set up yet — showing the published snapshot.';
  } else if (refreshFailed) {
    tone = 'notice'; text = 'Couldn’t refresh — this may be out of date.';
  }

  if (!text) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-3 bottom-[calc(76px+env(safe-area-inset-bottom))] sm:bottom-4 z-50 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-lg ${TONE[tone]}`}
    >
      <span>{text}</span>
      {dismissible && (
        <button type="button" onClick={dismiss} className="opacity-70 hover:opacity-100" aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
