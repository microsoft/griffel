// @ts-check

const { GriffelPlugin } = require('@griffel/webpack-plugin');

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
        use: [{ loader: '@griffel/webpack-plugin/loader' }],
      },
    ],
  },
  plugins: [/** @type {any} */ (new GriffelPlugin())],
};

module.exports = config;
