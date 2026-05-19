const fs = require('fs');
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

  // Prefer the file-based transport (`?file=<encoded path>`). This avoids the Linux PATH_MAX
  // limit hit by the prior inline `?style=<url-encoded css>` transport for large `.styles.ts`
  // files on BuildXL CI. Fall back to inline `?style=` for backwards compatibility with any
  // call sites that still embed CSS directly in the query string.
  const file = query.get('file');
  if (file) {
    return fs.readFileSync(file, 'utf8');
  }

  const style = query.get('style');

  return style ?? '';
}

module.exports = virtualLoader;
