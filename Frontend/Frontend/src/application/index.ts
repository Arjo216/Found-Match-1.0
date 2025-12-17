// src/application/index.ts
// Ensure this file exists and is the entry for the `@application` alias.

import HomePage from './pages/home/home.page';

// Expose the shape your pages/index.tsx expects:
export const homePage = {
  HomePage,
};

// Keep other re-exports you already had (so other imports keep working)
export * from './pages';
export * from './providers';
export * from './app/app.component';


