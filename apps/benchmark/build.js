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

esbuild
  .build({
    entryPoints: ['./src/index.tsx'],
    outfile: path.join(outDir, 'bundle.js'),
    minify: true,
    bundle: true,
    plugins: [ImportGlobPlugin()],
    ...(argv.watch && {
      watch: {
        onRebuild(error, result) {
          if (error) console.error('watch build failed:', error);
          else console.log('watch build succeeded:', result);
        },
      },
    }),
  })
  .then(() => {
    if (argv.watch) {
      console.log('watching');
    }
    fs.copyFileSync(path.resolve(__dirname, './index.html'), path.join(outDir, 'index.html'));
  })
  .catch(() => process.exit(1));
