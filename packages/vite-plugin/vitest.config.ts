import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,ts,tsx}'],
  },
  resolve: {
    alias: {
      '@griffel/core': path.resolve(__dirname, '../../dist/packages/core'),
      '@griffel/react': path.resolve(__dirname, '../../dist/packages/react'),
      '@griffel/tag-processor/make-styles': path.resolve(
        __dirname,
        '../../dist/packages/tag-processor/src/MakeStylesProcessor.js',
      ),
      '@griffel/tag-processor/make-reset-styles': path.resolve(
        __dirname,
        '../../dist/packages/tag-processor/src/MakeResetStylesProcessor.js',
      ),
    },
  },
});
