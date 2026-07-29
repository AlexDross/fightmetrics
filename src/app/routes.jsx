// ─── ROUTE REGISTRY ───────────────────────────────────────────────────────────
// Single source of truth for the app's seven destinations. Before Stage 5 the
// active screen was App-local `useState('home')`; the view IDs below are those
// same string literals, unchanged, so every existing `view === 'roi'` style
// comparison keeps working while the URL becomes the thing that actually holds
// the state.
//
// Nothing here knows about React. It is plain data plus total functions, so the
// mapping can be tested without a DOM, a router or a render.
//
// Deliberately NOT modelled here (Stage 5 scope): fighter/event/matchup detail
// routes, query-string state, and /model-lab. Adding any of those means adding
// them to this file first.

export const ROUTES = Object.freeze([
  { view: 'home', path: '/' },
  { view: 'simulator', path: '/simulator' },
  { view: 'upcoming', path: '/upcoming' },
  { view: 'roi', path: '/roi' },
  { view: 'statistics', path: '/statistics' },
  { view: 'explore', path: '/explore' },
  { view: 'info', path: '/info' },
]);

export const VIEWS = Object.freeze(ROUTES.map((r) => r.view));
export const PATHS = Object.freeze(ROUTES.map((r) => r.path));

export const HOME_VIEW = 'home';
export const HOME_PATH = '/';

const VIEW_TO_PATH = new Map(ROUTES.map((r) => [r.view, r.path]));
const PATH_TO_VIEW = new Map(ROUTES.map((r) => [r.path, r.view]));

/**
 * Canonicalises a pathname before lookup.
 *
 * Trailing slashes are STRIPPED, so `/simulator/` and `/simulator` are the same
 * destination. The alternative -- treating `/simulator/` as unknown and bouncing
 * it to `/` -- would punish a user who typed a trailing slash by silently
 * throwing away where they were trying to go.
 *
 * Root is the one exception: `/` must survive stripping, so it is returned
 * as-is. Repeated slashes (`///`) collapse to root for the same reason.
 *
 * Case is NOT normalised. `/ROI` stays unknown and redirects, because URL paths
 * are case-sensitive by spec and silently accepting variants would mean the
 * same screen had several addresses.
 */
export function canonicalPathname(pathname) {
  if (typeof pathname !== 'string' || pathname === '') return HOME_PATH;
  const stripped = pathname.replace(/\/+$/, '');
  return stripped === '' ? HOME_PATH : stripped;
}

/**
 * view id -> URL path. Returns the home path for an unknown view rather than
 * throwing, so a typo in a navigation call degrades to Home instead of
 * unmounting the app behind an error boundary.
 */
export function pathForView(view) {
  return VIEW_TO_PATH.get(view) ?? HOME_PATH;
}

/**
 * URL path -> view id, or `null` when the path is not one of the seven.
 *
 * Returning null rather than falling back to 'home' is what lets App tell
 * "render Home" apart from "this URL is wrong, replace it with /" -- the latter
 * needs a redirect, and a silent fallback would leave a bogus URL in the
 * address bar showing the Home screen.
 */
export function viewForPathname(pathname) {
  return PATH_TO_VIEW.get(canonicalPathname(pathname)) ?? null;
}

/** Whether a pathname maps to one of the seven known destinations. */
export function isKnownPathname(pathname) {
  return viewForPathname(pathname) !== null;
}
