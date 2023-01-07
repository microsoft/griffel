import type { ConfigAPI } from '@babel/core';
import linariaPreset, { PluginOptions } from '@linaria/babel-preset';

import { validateOptions } from './validateOptions';
import type { BabelPluginOptions } from './types';

export { default as shakerEvaluator } from '@linaria/shaker';
export { configSchema } from './schema';

export type { Evaluator, EvalRule } from '@linaria/utils';
export type { BabelPluginOptions };

export default function griffelPreset(babel: ConfigAPI, options: BabelPluginOptions = {}) {
  const { babelOptions, evaluationRules } = validateOptions(options);

  return linariaPreset(babel, {
    babelOptions,
    rules: evaluationRules,
  } as PluginOptions);
}
