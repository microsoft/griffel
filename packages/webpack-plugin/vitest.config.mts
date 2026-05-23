import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { conditions: ['@griffel/source'] },
  ssr: { resolve: { conditions: ['@griffel/source'] } },
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/webpack-plugin',
  test: {
    watch: false,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/webpack-plugin',
      provider: 'v8',
    },
  },
});
