// Stub used by vitest only.
// `GriffelCSSExtractionPlugin.loader = require.resolve('./webpackLoader')` from
// the source: under vitest the test patches Module._resolveFilename so that
// request resolves to this file, and Module._load to redirect loads of this
// path to the real loader module loaded through vite. webpack itself sees a
// regular .cjs file path and is happy.
// Excluded from the production build via tsconfig.lib.json exclude.
module.exports = function () {
  throw new Error('This is a fake file for vitest');
};
