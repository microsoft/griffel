module.exports = {
  stories: [],
  addons: ['@storybook/addon-essentials'],
  babel: async options => {
    return {
      ...options,
      presets: [...options.presets, '@babel/typescript'],
    };
  },
};
