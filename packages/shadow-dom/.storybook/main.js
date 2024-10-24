const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,
  core: { ...rootMain.core, builder: 'webpack5' },

  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },

  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', ...rootMain.addons, '@nx/react/plugins/storybook'],

  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }

    // add your own webpack tweaks if needed

    return config;
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
