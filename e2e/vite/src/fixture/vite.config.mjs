import { defineConfig } from 'vite';
import { griffel } from '@griffel/vite-plugin';

export default defineConfig({
  plugins: [griffel()],

  build: {
    minify: false,
    // Vite inlines small assets as data URIs, emit a real file instead so that rewriting of "url()"
    // references in the extracted CSS is covered
    assetsInlineLimit: 0,

    rollupOptions: {
      output: {
        // Content hashes would make the emitted file names differ per build, the suite asserts on them
        assetFileNames: '[name][extname]',
        entryFileNames: '[name].js',
      },
    },
  },
});
