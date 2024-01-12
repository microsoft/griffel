const esbuild = require('esbuild');
const ImportGlobPlugin = require('esbuild-plugin-import-glob').default;
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const argv = yargs(process.argv)
  .options({
    watch: { type: 'boolean', default: false },
  })
  .parseSync();

const outDir = path.resolve(__dirname, '../../dist/apps/benchmark/');

/** @type {esbuild.Plugin} */
const WatchRebuildPlugin = {
  name: 'watch-rebuild',
  setup(build) {
    build.onEnd(result => {
      if (result.errors.length === 0) {
        console.log('Rebuild was successful, watching for changes...');
      }

      console.log(`Reuild ended with ${result.errors.length} errors`);
      console.log(
        [result.errors, result.warnings]
          .flat()
          .map(e => e.text)
          .join('\n'),
      );
    });
  },
};

esbuild
  .build({
    entryPoints: ['./src/index.tsx'],
    outfile: path.join(outDir, 'bundle.js'),
    minify: true,
    bundle: true,

    plugins: /** @type {esbuild.Plugin[]} */ ([argv.watch && WatchRebuildPlugin, ImportGlobPlugin()].filter(Boolean)),
  })
  .then(() => {
    if (argv.watch) {
      console.log('watching');
    }
    fs.copyFileSync(path.resolve(__dirname, './index.html'), path.join(outDir, 'index.html'));
  })
  .catch(() => process.exit(1));
