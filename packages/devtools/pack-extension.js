// sync manifest version with package.json
const version = require('./package.json').version;
const manifestPath = '../../dist/packages/devtools/manifest.json';
const manifest = require(manifestPath);
manifest.version = version;
require('fs').writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// pack extension
// eslint-disable-next-line import/no-extraneous-dependencies
const zip = require('bestzip');
zip({
  source: '*',
  destination: '../ext.zip',
  cwd: '../../dist/packages/devtools/',
});
