// @ts-check

const { CssExtractRspackPlugin } = require('@rspack/core');
const { GriffelCSSExtractionPlugin } = require('@griffel/webpack-extraction-plugin');

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
  plugins: [/** @type {any} */ (new GriffelCSSExtractionPlugin()), new CssExtractRspackPlugin()],
};

module.exports = config;
