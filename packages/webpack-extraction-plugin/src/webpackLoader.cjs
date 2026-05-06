// Stub used by vitest only.
// In production builds, `require.resolve('./webpackLoader')` from the compiled
// GriffelCSSExtractionPlugin.js finds the sibling `webpackLoader.js` (.js comes
// before .cjs in Node's default extensions). Under vitest there is no compiled
// .js — only `webpackLoader.ts` (which Node doesn't recognise) — so the resolver
// falls through to this .cjs file. The test patches Module._load to redirect
// loads of this path to the real loader's default export.
module.exports = function () {
  throw new Error('This is a fake file for vitest');
};
