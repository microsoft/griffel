const { RegisterMappingsLoaderContextKey } = require('../src/constants');

/**
 * @this {import("../src/constants").SupplementedLoaderCotext}
 * @return {String}
 */
function virtualLoader() {
  return this[RegisterMappingsLoaderContextKey]?.getExtractedCss() ?? '';
}

module.exports = virtualLoader;
