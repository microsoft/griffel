// @ts-check
const CopyPlugin = require('copy-webpack-plugin');

/** @type {(config: import("webpack").Configuration) => import("webpack").Configuration} */
const webpackConfig = config => ({
  ...config,
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
        },
      ],
    }),
  ],
});

module.exports = webpackConfig;
