// @ts-check

const { GriffelCSSExtractionPlugin } = require('@griffel/webpack-extraction-plugin');

/**
 * @type {import('@rspack/core').Configuration}
 */
const config = {
  mode: 'production',
  experiments: {
    css: true,
  },
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
      {
        test: /\.css$/,
        type: 'css',
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [/** @type {any} */ (new GriffelCSSExtractionPlugin())],
};

module.exports = config;
