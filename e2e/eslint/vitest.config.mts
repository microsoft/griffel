import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/e2e/eslint',
  plugins: [nxViteTsPaths()],
  test: {
    watch: false,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    // This suite packs tarballs, runs a real `yarn install` and then ESLint in a subprocess.
    // Measured wall clock is ~11s with a warm Yarn cache; 120s leaves room for a cold CI cache
    // without letting a genuinely hung install burn the whole job.
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // Concurrent `yarn install`s contend on the shared Yarn cache. Keep the strictly sequential
    // behaviour the custom runner had.
    fileParallelism: false,
  },
});
