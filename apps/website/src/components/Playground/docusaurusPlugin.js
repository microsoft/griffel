const path = require('path');

// Docusaurus plugin that modifies Webpack config to process files in "templates" folder.
/** @type {import('@docusaurus/types').PluginModule} */
module.exports = function () {
  return {
    name: 'playground-docusaurus-plugin',
    configureWebpack() {
      return {
        module: {
          rules: [
            {
              test: /\.js$/,
              include: path.resolve(__dirname, 'code', 'templates'),
              use: [{ loader: 'raw-loader' }, { loader: require.resolve('./webpackLoader') }],
            },
          ],
        },
      };
    },
  };
};
