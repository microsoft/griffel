import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default {
  core: {},
  stories: [],
  addons: [getAbsolutePath('@storybook/addon-webpack5-compiler-babel')],
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}
