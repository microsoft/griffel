// Stub used by vitest only.
// `virtual-loader/index.js` does `require('../src/constants')` at webpack
// runtime (Node CJS). Under vitest the test patches Module._resolveFilename
// so that request resolves to this file. Symbol.for(...) is global, so the
// symbol matches the one loaded from constants.ts via the vite pipeline.
// Excluded from the production build via tsconfig.lib.json exclude.
const PLUGIN_NAME = 'GriffelExtractPlugin';
const GriffelCssLoaderContextKey = Symbol.for(`${PLUGIN_NAME}/GriffelCssLoaderContextKey`);

module.exports = {
  PLUGIN_NAME,
  GriffelCssLoaderContextKey,
};
