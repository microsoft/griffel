const esbuild = require('esbuild');
const ImportGlobPlugin = require('esbuild-plugin-import-glob').default;
const TSAliasPlugin = require('esbuild-plugin-alias');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const shouldWatch = yargs.argv.watch;

const outDir = path.resolve(__dirname, '../../dist/apps/benchmark/');

esbuild
  .build({
    entryPoints: ['./src/index.tsx'],
    outfile: path.join(outDir, 'bundle.js'),
    minify: true,
    bundle: true,
    plugins: [
      TSAliasPlugin({
        '@griffel/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
        '@griffel/react': path.resolve(__dirname, '../../packages/react/src/index.ts'),
      }),
      ImportGlobPlugin(),
    ],
    ...(shouldWatch && {
      watch: {
        onRebuild(error, result) {
          if (error) console.error('watch build failed:', error);
          else console.log('watch build succeeded:', result);
        },
      },
    }),
  })
  .then(() => {
    if (shouldWatch) {
      console.log('watching');
    }
    fs.copyFileSync(path.resolve(__dirname, './index.html'), path.join(outDir, 'index.html'));
  })
  .catch(() => process.exit(1));
