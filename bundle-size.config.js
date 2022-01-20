const path = require('path');

module.exports = {
  webpack: config => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          '@griffel/core': path.resolve(__dirname, './dist/packages/core/index.esm.js'),
          '@griffel/react': path.resolve(__dirname, './dist/packages/react/index.esm.js'),
        },
      },
    };
  },
};
