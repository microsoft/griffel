const { GriffelCssLoaderContextKey } = require('../src/constants');

/**
 * @this {import("../src/constants").SupplementedLoaderContext}
 * @return {String}
 */
function virtualLoader() {
  return this[GriffelCssLoaderContextKey]?.getExtractedCss() ?? '';
}

module.exports = virtualLoader;
