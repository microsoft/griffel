const path = require('path');

module.exports = {
  repository: 'https://github.com/microsoft/griffel',
  storage: require('monosize-storage-upstash')({
    url: 'https://us1-nearby-hyena-35747.upstash.io',
    readonlyToken:
      'AoujASQgNGQwNGI0YjAtNmExNy00MzNjLWIwNTQtMTIyMGRlODQwZDk2QaCJNVtEfHj6pDLLscOcgMEt-Be1VWcMYbMRR_EqVCw=',
  }),
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
