/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

const dependencies: string[] = Object.keys(packageJson.dependencies || {});
const external = ([/node:/] as (string | RegExp)[]).concat(dependencies);

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/webpack-plugin',
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    dts({ entryRoot: 'src', tsconfigPath: join(__dirname, 'tsconfig.lib.json'), pathsToAliases: false }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.mts'),
      formats: ['es' as const],
      target: 'node20' as const,
    },
    rollupOptions: {
      external,
    },
    minify: false,
  },
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/webpack-plugin',
      provider: 'v8' as const,
    },
  },
}));
