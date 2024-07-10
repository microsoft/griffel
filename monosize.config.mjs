import path from 'node:path';
import upstashStorage from 'monosize-storage-upstash';
import webpackBundler from 'monosize-bundler-webpack';

const dirname = new URL('.', import.meta.url).pathname;

export default {
  repository: 'https://github.com/microsoft/griffel',
  bundler: webpackBundler(config => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        '@griffel/core': path.resolve(dirname, './dist/packages/core/index.esm.js'),
        '@griffel/shadow-dom': path.resolve(dirname, './dist/packages/shadow-dom/index.esm.js'),
        '@griffel/react': path.resolve(dirname, './dist/packages/react/index.esm.js'),
      },
    },
  })),
  storage: upstashStorage({
    url: 'https://us1-nearby-hyena-35747.upstash.io',
    readonlyToken:
      'AoujASQgNGQwNGI0YjAtNmExNy00MzNjLWIwNTQtMTIyMGRlODQwZDk2QaCJNVtEfHj6pDLLscOcgMEt-Be1VWcMYbMRR_EqVCw=',
  }),
};
