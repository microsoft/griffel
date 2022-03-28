import { transformPlugin } from './transformPlugin';

import type { ConfigAPI } from '@babel/core';
import type { BabelPluginOptions } from './types';

export { default as shakerEvaluator } from '@linaria/shaker';
export { configSchema } from './schema';

export type { Evaluator, EvalRule } from '@linaria/babel-preset';
export type { BabelPluginOptions };

export default function griffelPreset(babel: ConfigAPI, options: BabelPluginOptions) {
  return {
    plugins: [[transformPlugin, options]],
  };
}
