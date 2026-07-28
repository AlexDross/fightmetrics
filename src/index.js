import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Stage 1a: Tailwind is now compiled at build time from this stylesheet.
// It already contained the correct @tailwind directives and was imported by
// nothing; the runtime CDN (cdn.tailwindcss.com) has been removed from
// index.html.
import './style.css';

import App from './App';

// Foundation Stage 0 -- dev-only golden capture harness.
// Removed together with the App.js dev bridge in Stage 4.
// Guard swapped from process.env.NODE_ENV to import.meta.env.DEV in Stage 1a.
if (import.meta.env.DEV) {
  import('./__dev__/goldenHarness.js');
}

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
