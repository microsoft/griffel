// @ts-check

const { CssExtractRspackPlugin } = require('@rspack/core');
const { GriffelPlugin } = require('@griffel/webpack-plugin');

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
        use: [{ loader: '@griffel/webpack-plugin/loader' }],
      },
      {
        test: /\.css$/,
        use: [CssExtractRspackPlugin.loader, 'css-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [/** @type {any} */ (new GriffelPlugin()), new CssExtractRspackPlugin()],
};

module.exports = config;
