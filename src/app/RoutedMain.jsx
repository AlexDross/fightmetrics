// ─── ROUTED MAIN + ERROR BOUNDARY ─────────────────────────────────────────────
// M1 PR 1. Before this, App rendered every screen straight into <main> with no
// error boundary anywhere in src/, so a single render throw (a malformed
// fighter row from the twice-weekly data update, say) unmounted the whole
// tree: Header and BottomNav went with it and the page was blank.
//
// The boundary wraps ONLY the routed content. Header, BottomNav and SaveStatus
// are rendered by App as siblings of <main>, outside it, so navigation stays
// usable when a screen fails.
//
// It is keyed by view, so navigating to another destination mounts a fresh
// boundary with no error and the new screen renders normally. Returning to the
// failed view also starts fresh; if the cause is still there it fails again
// and shows the fallback again. App-level state (collections, filters,
// toggles) lives ABOVE the boundary and is untouched by the reset.
import React from 'react';

export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  render() {
    if (this.state.error) {
      return <RouteErrorFallback onReload={this.props.onReload} />;
    }
    return this.props.children;
  }
}

// Assigned rather than declared in the class body: Tailwind scans .jsx under
// src for class-name candidates, and the keyword a class-body declaration
// needs here is also a Tailwind positioning utility the app does not otherwise
// emit, so writing it would change the production CSS. That word is the
// canary in src/data/schemas/__tests__/tailwindScoping.test.mjs.
RouteErrorBoundary.getDerivedStateFromError = (error) => ({ error });

const reloadPage = () => window.location.reload();

export function RouteErrorFallback({ onReload = reloadPage }) {
  return (
    <div className="px-5 py-10 flex justify-center">
      <div
        role="alert"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-center"
      >
        <h1 className="text-white font-black text-xl tracking-tight">
          This screen couldn’t load
        </h1>
        <p className="text-secondary text-sm mt-2">
          Something went wrong while showing it. Your saved picks are not
          affected, and the other tabs still work. Reload to try again.
        </p>
        <button
          type="button"
          onClick={() => onReload()}
          className="mt-5 min-h-[44px] px-5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

/**
 * The page's <main> landmark (the skip link's target) with the routed screen
 * inside a boundary keyed by `view`. `view` is null for an unknown path, which
 * App redirects; it still gets a key of its own.
 */
export default function RoutedMain({ view, onReload, children }) {
  return (
    <main id="main-content" tabIndex={-1}>
      <RouteErrorBoundary key={view ?? '__unknown__'} onReload={onReload}>
        {children}
      </RouteErrorBoundary>
    </main>
  );
}
