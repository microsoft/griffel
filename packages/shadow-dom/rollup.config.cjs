const { withNx } = require('@nx/rollup/with-nx');
const getRollupOptions = require('../../tools/getRollupOptions');

module.exports = getRollupOptions(
  withNx({
    main: './src/index.ts',
    outputPath: './dist',
    tsConfig: './tsconfig.lib.json',
    compiler: 'babel',
    format: ['esm', 'cjs'],
    external: ['tslib'],
    sourceMap: true,
  }),
);
