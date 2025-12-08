import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

import rootMain from '../../../.storybook/main.js';

const require = createRequire(import.meta.url);

export default {
  ...rootMain,

  core: {
    ...rootMain.core,
    builder: getAbsolutePath('webpack5'),
  },
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },

  stories: [...rootMain.stories, '../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
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
