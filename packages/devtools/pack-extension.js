const fs = require('fs');
const path = require('path');
const zip = require('bestzip');

const DIST_PATH = path.resolve(__dirname, '../../dist/packages/devtools');

if (!fs.existsSync(DIST_PATH)) {
  console.error(`"${DIST_PATH}" does not exist, please run "build" command first`);
  process.exit(1);
}

// Syncs the version from "package.json" with "manifest.json"
const actualVersion = require('./package.json').version;

const manifestPath = path.resolve(DIST_PATH, 'manifest.json');
const manifestJSON = require(manifestPath);

fs.writeFileSync(
  manifestPath,
  JSON.stringify(
    {
      ...manifestJSON,
      version: actualVersion,
    },
    null,
    2,
  ),
);

// Pack extension into .zip archive for publishing
// eslint-disable-next-line import/no-extraneous-dependencies
zip({
  source: '*',
  destination: '../ext.zip',
  cwd: DIST_PATH,
});

