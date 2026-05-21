const { GriffelCssLoaderContextKey } = require('../dist/constants.js');

/**
 * @this {import("../dist/constants").SupplementedLoaderContext}
 * @return {String}
 */
function virtualLoader() {
  return this[GriffelCssLoaderContextKey]?.getExtractedCss() ?? '';
}

module.exports = virtualLoader;
