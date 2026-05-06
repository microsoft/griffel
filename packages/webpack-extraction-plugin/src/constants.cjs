// Stub used by vitest only.
// `virtual-loader/index.js` does `require('../src/constants')` at webpack
// runtime. In production this resolves to the compiled constants.js. Under
// vitest there is only `constants.ts` (which Node doesn't recognise) — once
// the test registers .cjs in Module._extensions, the resolver finds this stub.
// The Symbol.for(...) call is global, so the symbol is identical to the one
// loaded from constants.ts via the vite pipeline.
const PLUGIN_NAME = 'GriffelExtractPlugin';
const GriffelCssLoaderContextKey = Symbol.for(`${PLUGIN_NAME}/GriffelCssLoaderContextKey`);

module.exports = {
  PLUGIN_NAME,
  GriffelCssLoaderContextKey,
};
