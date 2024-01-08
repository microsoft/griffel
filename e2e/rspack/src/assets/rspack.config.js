// @ts-check

const { GriffelCSSExtractionPlugin } = require('@griffel/webpack-extraction-plugin');
const path = require('path');

/**
 * @type {import('@rspack/core').Configuration}
 */
const config = {
  mode: 'production',
  externals: {
    '@griffel/react': 'Griffel',
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{ loader: GriffelCSSExtractionPlugin.loader }, { loader: '@griffel/webpack-loader' }],
      },
    ],
  },
  plugins: [/** @type {any} */ (new GriffelCSSExtractionPlugin())],
  resolve: {
    alias: {
      'fake-module': path.resolve(__dirname, 'src', 'Component.js'),
      'fake-colors': path.resolve(__dirname, 'src', 'colors.js'),
    },
  },
};

module.exports = config;
