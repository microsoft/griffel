/**
 * Deprecates the broken versions published by commit ef0b28a1.
 *
 * Usage:
 *   node tools/deprecate-broken-release.mjs           # dry-run, prints commands
 *   node tools/deprecate-broken-release.mjs --apply   # actually run npm deprecate
 *
 * Requires being logged in to npm with publish rights for @griffel/*.
 */
import { spawnSync } from 'node:child_process';

const MESSAGE =
  'This version was published from a broken build artifact (commit ef0b28a1). ' +
  'Please upgrade to the next patch release.';

const VERSIONS = {
  '@griffel/babel-preset': '1.8.5',
  '@griffel/core': '1.21.1',
  '@griffel/devtools': '0.3.11',
  '@griffel/eslint-plugin': '3.0.1',
  '@griffel/jest-serializer': '1.1.40',
  '@griffel/postcss-syntax': '1.3.11',
  '@griffel/react': '1.7.3',
  '@griffel/shadow-dom': '0.2.16',
  '@griffel/style-types': '1.4.1',
  '@griffel/transform': '3.0.5',
  '@griffel/transform-shaker': '1.0.6',
  '@griffel/webpack-extraction-plugin': '0.5.18',
  '@griffel/webpack-loader': '2.2.27',
  '@griffel/webpack-plugin': '4.0.5',
};

const apply = process.argv.includes('--apply');

if (!apply) {
  console.log('Dry-run. Pass --apply to actually deprecate.\n');
}

let failed = 0;
for (const [name, version] of Object.entries(VERSIONS)) {
  const spec = `${name}@${version}`;
  const args = ['deprecate', spec, MESSAGE];

  console.log(`npm ${args.map(a => (a.includes(' ') ? JSON.stringify(a) : a)).join(' ')}`);

  if (!apply) continue;

  const result = spawnSync('npm', args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`  failed (exit ${result.status})`);
    failed++;
  }
}

if (apply) {
  console.log(`\nDone. ${failed === 0 ? 'All deprecations succeeded.' : `${failed} failed.`}`);
  process.exit(failed === 0 ? 0 : 1);
}
