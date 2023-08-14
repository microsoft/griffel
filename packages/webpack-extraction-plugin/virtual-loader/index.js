const { GriffelCssLoaderContextKey } = require('../src/constants');

/**
 * @this {import("../src/constants").SupplementedLoaderContext}
 * @return {String}
 */
function virtualLoader() {
  const type = /** @type {'safe'|'unsafe'} */ (this.resourceQuery.slice(1));

  return this[GriffelCssLoaderContextKey]?.getCSSOutput(type) ?? '';
}

module.exports = virtualLoader;
