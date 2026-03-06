import upstashStorage from 'monosize-storage-upstash';
import webpackBundler from 'monosize-bundler-webpack';

export default {
  repository: 'https://github.com/microsoft/griffel',
  bundler: webpackBundler(),
  storage: upstashStorage({
    url: 'https://welcome-giraffe-61766.upstash.io',
    readonlyToken:
      'AvFGAAIgcDHzHKwMeSqS_FCutK3bcM-AI7c7zSKbRYbAM14_ZiwUmg',
  }),
};
