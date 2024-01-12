module.exports = {
  babel: async options => {
    return {
      ...options,
      presets: [...options.presets, '@babel/typescript'],
    };
  },
  core: {},
  stories: [],
  addons: [],
};
