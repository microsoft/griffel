import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/react',
  plugins: [nxViteTsPaths()],
  define: {
    IS_REACT_ACT_ENVIRONMENT: true,
  },
  test: {
    watch: false,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/react',
      provider: 'v8',
    },
  },
});
