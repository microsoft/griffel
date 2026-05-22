const GriffelCssLoaderContextKey = Symbol.for(`GriffelExtractPlugin/GriffelCssLoaderContextKey`);

/**
 * @this {import("../src/constants").SupplementedLoaderContext}
 * @return {String}
 */
function virtualLoader() {
  return this[GriffelCssLoaderContextKey]?.getExtractedCss() ?? '';
}

module.exports = virtualLoader;
