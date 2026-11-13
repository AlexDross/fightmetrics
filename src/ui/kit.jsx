/**
 * Shared UI kit. Every component styles itself from the design tokens in
 * src/style.css (bg-surface, border-line, text-good, bg-accent ...), so new
 * screens get the same look without restating palette shades.
 *
 * Kept deliberately small: add a component here when the same markup appears
 * on a second screen, not before.
 */

const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Class strings for native controls that are styled in place. */
export const inputClass =
  'bg-surface-2 border border-line-strong text-slate-200 text-sm rounded-lg px-3 py-2 focus:border-accent';
export const primaryButtonClass =
  'rounded-lg bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:bg-surface-2 disabled:text-muted';

/** A panel on the page canvas. */
export function Card({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cx('bg-surface border border-line rounded-2xl', className)} {...rest}>
      {children}
    </Tag>
  );
}

/** The small uppercase heading that introduces a group of cards. */
export function SectionLabel({ children, className }) {
  return (
    <p className={cx('text-muted text-xs font-semibold uppercase tracking-wider mb-3', className)}>{children}</p>
  );
}

const TONE_TEXT = {
  good: 'text-good',
  bad: 'text-bad',
  warn: 'text-warn',
  info: 'text-info',
  neutral: 'text-white',
};

/**
 * A headline number with its label and a line of context.
 * `tone` colours the value: good, bad, warn, info or neutral.
 */
export function StatTile({ label, value, tone = 'neutral', detail, empty, className }) {
  return (
    <Card className={cx('p-5', className)}>
      <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-2">{label}</p>
      {empty ? (
        <p className="text-muted text-sm mt-1">{empty}</p>
      ) : (
        <>
          <p className={cx('tabular font-bold text-3xl tracking-tight', TONE_TEXT[tone] ?? TONE_TEXT.neutral)}>{value}</p>
          {detail && <p className="text-muted text-xs mt-1">{detail}</p>}
        </>
      )}
    </Card>
  );
}

const TAG_TONE = {
  good: 'bg-good/12 text-good',
  bad: 'bg-bad/12 text-bad',
  warn: 'bg-warn/12 text-warn',
  info: 'bg-info/12 text-info',
  accent: 'bg-accent/15 text-accent-hover',
  muted: 'bg-surface-3 text-secondary',
};

/** A compact status label: CORRECT, LEAN, NO BET ... */
export function Tag({ tone = 'muted', className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold',
        TAG_TONE[tone] ?? TAG_TONE.muted,
        className
      )}
    >
      {children}
    </span>
  );
}

/** Shimmering placeholder shown while data loads. Size it with className. */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cx('skeleton', className)} />;
}
