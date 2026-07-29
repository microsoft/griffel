import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/e2e/typescript',
  plugins: [nxViteTsPaths()],
  test: {
    watch: false,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    // Each command these suites run carries its own timeout (see `sh()` in `@griffel/e2e-utils`),
    // which is what actually bounds them: it kills the process instead of only abandoning the
    // promise, and reports which command hung. These are the backstop for anything outside a
    // command, so they sit above the largest of those budgets rather than below it — a 120s hook
    // was killing installs that were merely slow, not stuck.
    testTimeout: 120_000,
    hookTimeout: 420_000,
    // Concurrent `yarn install`s contend on the shared Yarn cache. Keep the strictly sequential
    // behaviour the custom runner had.
    fileParallelism: false,
  },
});
