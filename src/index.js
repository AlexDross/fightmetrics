import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Stage 1a: Tailwind is now compiled at build time from this stylesheet.
// It already contained the correct @tailwind directives and was imported by
// nothing; the runtime CDN (cdn.tailwindcss.com) has been removed from
// index.html.
import './style.css';

import { BrowserRouter } from 'react-router-dom';

import App from './App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Stage 5: BrowserRouter sits ABOVE App and outside every route match, so App
// itself is never remounted by navigation -- it re-renders with a new
// location. That is what keeps App-level Upcoming / ROI / Props / Parlay state
// alive across tab changes; mounting App inside a <Route element> instead would
// discard all of it on every click.
//
// Deep links need the server to serve index.html for unknown paths. vercel.json
// already rewrites everything except assets to /index.html, and Vite's dev
// server and preview both do this by default, so no config change was required.
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
