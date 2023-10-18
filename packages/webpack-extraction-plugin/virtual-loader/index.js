const { URLSearchParams } = require('url');
const { GriffelCssLoaderContextKey } = require('../src/constants');

/**
 * @this {import("../src/constants").SupplementedLoaderContext}
 * @return {String}
 */
function virtualLoader() {
  if (this.webpack) {
    return this[GriffelCssLoaderContextKey]?.getExtractedCss() ?? '';
  }

  const query = new URLSearchParams(this.resourceQuery);
  const style = query.get('style');

  return style ?? '';
}

module.exports = virtualLoader;
