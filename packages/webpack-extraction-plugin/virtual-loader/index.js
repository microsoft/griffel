/**
 * @this {import('webpack').LoaderContext<{ style?: string }>}
 * @return {String}
 */
function virtualLoader() {
  const { style = '' } = this.getOptions();

  return style;
}

module.exports = virtualLoader;
