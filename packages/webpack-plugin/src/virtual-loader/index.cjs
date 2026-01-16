const { URLSearchParams } = require('url');

const GriffelCssLoaderContextKey = Symbol.for(`GriffelExtractPlugin/GriffelCssLoaderContextKey`);

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
