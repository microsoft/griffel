const { dirname, join } = require('node:path');
const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,

  core: {
    ...rootMain.core,
    builder: getAbsolutePath('webpack5'),
  },
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },

  stories: [...rootMain.stories, '../src/**/*.stories.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    ...rootMain.addons,
    getAbsolutePath('@nx/react/plugins/storybook'),
  ],

  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }

    // add your own webpack tweaks if needed

    return config;
  },
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}
