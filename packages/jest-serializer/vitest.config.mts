import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { conditions: ['@griffel/source'] },
  ssr: { resolve: { conditions: ['@griffel/source'] } },
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/jest-serializer',
  test: {
    watch: false,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/jest-serializer',
      provider: 'v8',
    },
  },
});
