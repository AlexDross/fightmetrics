import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Stage 1a: Tailwind is now compiled at build time from this stylesheet.
// It already contained the correct @tailwind directives and was imported by
// nothing; the runtime CDN (cdn.tailwindcss.com) has been removed from
// index.html.
import './style.css';

import App from './App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
