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
        '@griffel/core': path.resolve(dirname, './dist/packages/core/src/index.js'),
        '@griffel/shadow-dom': path.resolve(dirname, './dist/packages/shadow-dom/src/index.js'),
        '@griffel/react': path.resolve(dirname, './dist/packages/react/src/index.js'),
      },
    },
    externals: {
      ...config.externals,
      'react/jsx-runtime': 'JSX',
    },
  })),
  storage: upstashStorage({
    url: 'https://welcome-giraffe-61766.upstash.io',
    readonlyToken: 'AvFGAAIgcDHzHKwMeSqS_FCutK3bcM-AI7c7zSKbRYbAM14_ZiwUmg',
  }),
};
