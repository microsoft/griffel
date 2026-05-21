import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  resolve: { conditions: ['@griffel/source'] },
  ssr: { resolve: { conditions: ['@griffel/source'] } },
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/postcss-syntax',
  plugins: [nxViteTsPaths()],
  test: {
    watch: false,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/postcss-syntax',
      provider: 'v8',
    },
  },
});
