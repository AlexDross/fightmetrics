/** @type {import('tailwindcss').Config} */
// Foundation Stage 1a -- Tailwind v3, compiled at build time.
//
// This replaces the v3 Play CDN (cdn.tailwindcss.com), which generated CSS in
// the browser on every page load. Stage 1b upgrades v3 -> v4 separately, so any
// visual difference can be attributed to one migration or the other.
//
// `content` is required in v3 (v4 detects sources automatically). Verified
// safe: all 136 interpolated className template literals in src/App.js insert
// COMPLETE class strings (e.g. 'bg-emerald-900/40 text-emerald-400') rather
// than building fragments like `bg-${color}-500`, so every class Tailwind must
// emit is statically present in the source. No safelist needed.
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
