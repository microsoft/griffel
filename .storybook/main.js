const { dirname, join } = require('node:path');

module.exports = {
  core: {},
  stories: [],
  addons: [getAbsolutePath('@storybook/addon-webpack5-compiler-babel')],
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}
