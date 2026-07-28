import path from 'node:path';
import gitStorage from 'monosize-storage-git';
import webpackBundler from 'monosize-bundler-webpack';

const dirname = new URL('.', import.meta.url).pathname;

/** @type {import('monosize').MonoSizeConfig} */
const config = {
  repository: 'https://github.com/microsoft/griffel',
  bundler: webpackBundler(config => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        '@griffel/core': path.resolve(dirname, './dist/packages/core/src/index.js'),
        '@griffel/sort-css-queries': path.resolve(dirname, './dist/packages/sort-css-queries/src/index.js'),
        '@griffel/shadow-dom': path.resolve(dirname, './dist/packages/shadow-dom/src/index.js'),
        '@griffel/react': path.resolve(dirname, './dist/packages/react/src/index.js'),
      },
    },
    externals: {
      ...config.externals,
      'react/jsx-runtime': 'JSX',
    },
  })),
  threshold: '1.5kB',
  storage: gitStorage({
    owner: 'microsoft',
    repo: 'griffel',
    workflowFileName: 'bundle-size-baseline.yml',
    outputPath: path.resolve(dirname, './dist/monosize-report.json'),
  }),
};

export default config;
