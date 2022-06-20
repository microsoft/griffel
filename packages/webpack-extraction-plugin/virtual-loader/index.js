const { URLSearchParams } = require('url');

/**
 * @this {import('webpack').LoaderContext<unknown>}
 * @return {String}
 */
function virtualLoader() {
  const query = new URLSearchParams(this.resourceQuery);
  const styleRule = query.get('style');

  return styleRule ?? '';
}

module.exports = virtualLoader;
