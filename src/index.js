import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

// Foundation Stage 0 -- dev-only golden capture harness.
// Removed together with the App.js dev bridge in Stage 4.
// Stage 1a mechanically replaces this guard with `import.meta.env.DEV`
// once Vite is the bundler. Do not introduce import.meta.env under CRA.
if (process.env.NODE_ENV !== 'production') {
  import('./__dev__/goldenHarness.js');
}

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
