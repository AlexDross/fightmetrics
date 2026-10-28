// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
// M1 PR 2. Replaces window.confirm / window.prompt / window.alert for the
// app's destructive actions. The native dialogs were unstyled, rendered the
// messages' \n separators as raw line breaks in a browser-owned box, and are
// suppressed outright in some embedded browsers (where confirm() returns false
// and the action silently does nothing).
//
// Usage: ConfirmProvider is mounted once (src/index.js, around App). Any
// component below it calls
//
//   const confirm = useConfirm();
//   if (await confirm({ title, details, warning, confirmLabel })) onDelete(id);
//
// confirm() resolves true only on an explicit Confirm. Cancel, Escape and a
// click on the backdrop all resolve false. Opening a second dialog while one is
// up resolves the first one false, so a caller is never left waiting.
//
// Accessibility: role="alertdialog" + aria-modal, labelled by the title and
// described by the body. Focus moves into the dialog (to Cancel, the safe
// choice, or to the text field when one is required), Tab and Shift+Tab are
// kept inside it, and focus returns to the control that opened it.
import React, {
  createContext, useCallback, useContext, useEffect, useId, useRef, useState,
} from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const requestRef = useRef(null);
  const seqRef = useRef(0);

  const confirm = useCallback((options) => new Promise((resolve) => {
    // A newer request supersedes an open one; the old caller gets "no".
    if (requestRef.current) requestRef.current.resolve(false);
    const next = {
      options,
      resolve,
      returnFocus: typeof document !== 'undefined' ? document.activeElement : null,
      seq: (seqRef.current += 1),
    };
    requestRef.current = next;
    setRequest(next);
  }), []);

  const settle = useCallback((result) => {
    const current = requestRef.current;
    if (!current) return;
    requestRef.current = null;
    setRequest(null);
    const el = current.returnFocus;
    if (el && el.isConnected && typeof el.focus === 'function') el.focus();
    current.resolve(result);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <ConfirmDialog
          key={request.seq}
          {...request.options}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

/** Returns confirm(options) => Promise<boolean>. Requires ConfirmProvider. */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return confirm;
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * title         the question, e.g. "Delete this pick?"
 * details       lines identifying what is affected (matchup, event, result)
 * warning       consequence line, e.g. "This cannot be undone."
 * confirmLabel  the action, e.g. "Delete"
 * requireText   when set, Confirm stays disabled until the field matches it
 *               (whitespace-trimmed); requireTextLabel labels the field.
 */
export function ConfirmDialog({
  title,
  details = [],
  warning,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  requireText,
  requireTextLabel,
  onConfirm,
  onCancel,
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const bodyId = `${id}-body`;
  const inputId = `${id}-input`;
  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  const inputRef = useRef(null);
  const [typed, setTyped] = useState('');

  const needsText = requireText !== undefined && requireText !== null;
  const matched = !needsText || typed.trim() === String(requireText);
  const lines = details.filter(Boolean);

  useEffect(() => {
    (needsText ? inputRef.current : cancelRef.current)?.focus();
  }, [needsText]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onKeyDown={onKeyDown}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl"
      >
        <h2 id={titleId} className="text-white font-bold text-base leading-snug">
          {title}
        </h2>
        <div id={bodyId} className="mt-2 space-y-1">
          {lines.map((line, i) => (
            <p key={i} className="text-secondary text-sm">{line}</p>
          ))}
          {warning && <p className="text-red-300 text-sm font-semibold pt-1">{warning}</p>}
        </div>
        {needsText && (
          <div className="mt-4">
            <label htmlFor={inputId} className="block text-secondary text-xs font-semibold mb-1.5">
              {requireTextLabel ?? `Type ${requireText} to confirm`}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && matched) { e.preventDefault(); onConfirm(); } }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        )}
        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 rounded-lg border border-slate-700 text-secondary text-sm font-semibold hover:text-white hover:border-slate-600"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!matched}
            className="min-h-[44px] px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
