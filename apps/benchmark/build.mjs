import esbuild from 'esbuild';
import ImportGlobPlugin from 'esbuild-plugin-import-glob';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(CURRENT_DIR, '../../dist/apps/benchmark/');

const argv = yargs(process.argv)
  .options({
    watch: { type: 'boolean', default: false },
  })
  .parseSync();

/** @type {esbuild.Plugin} */
const WatchRebuildPlugin = {
  name: 'watch-rebuild',
  setup(build) {
    build.onEnd(result => {
      if (result.errors.length === 0) {
        console.log('Rebuild was successful, watching for changes...');
      }

      console.log(`Rebuild ended with ${result.errors.length} errors`);
      console.log(
        [result.errors, result.warnings]
          .flat()
          .map(e => e.text)
          .join('\n'),
      );
    });
  },
};

/** @type {esbuild.BuildOptions} */
const esbuildConfig = {
  entryPoints: ['./src/index.tsx'],
  outfile: path.join(OUT_DIR, 'bundle.js'),
  minify: true,
  bundle: true,

  plugins: /** @type {esbuild.Plugin[]} */ (
    [argv.watch && WatchRebuildPlugin, ImportGlobPlugin.default()].filter(Boolean)
  ),
};

async function copyIndexHtml() {
  await fs.promises.copyFile(path.resolve(CURRENT_DIR, './index.html'), path.join(OUT_DIR, 'index.html'));
}

if (argv.watch) {
  const context = await esbuild.context(esbuildConfig);

  await copyIndexHtml();
  await context.watch();
} else {
  try {
    await esbuild.build(esbuildConfig);
    await copyIndexHtml();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
