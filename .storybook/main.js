module.exports = {
  stories: [],
  addons: ['@storybook/addon-essentials'],
  babel: async options => {
    return {
      ...options,
      presets: [...options.presets, '@nrwl/react/babel'],
    };
  },
};
