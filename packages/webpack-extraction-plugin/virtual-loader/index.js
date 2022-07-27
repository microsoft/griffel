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

exports.default = virtualLoader;

/**
 * Moves CSSloader to the end of the loader queue so it runs first.
 */
/**
 * @this {import('webpack').LoaderContext<unknown>}
 * @return {void}
 */
function pitch() {
  if (this.loaders[0].pitch !== pitch) {
    // If the first loader isn't this one - skip.
    return;
  }
  // The first loader is Griffel's css-loader - we need to shift
  // it to be at the end of the loader chain so it runs first (instead of last).
  const firstLoader = this.loaders.shift();

  if (typeof firstLoader !== 'undefined') {
    this.loaders.push(firstLoader);
  }
}
exports.pitch = pitch;
