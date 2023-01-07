import type { ConfigAPI } from '@babel/core';
import linariaPreset, { PluginOptions } from '@linaria/babel-preset';

import { validateOptions } from './validateOptions';
import type { BabelPluginOptions, BabelPluginMetadata } from './types';

export { default as shakerEvaluator } from '@linaria/shaker';
export { configSchema } from './schema';

export type { Evaluator, EvalRule } from '@linaria/utils';
export type { BabelPluginOptions, BabelPluginMetadata };

export default function griffelPreset(babel: ConfigAPI, options: BabelPluginOptions = {}) {
  const { babelOptions, evaluationRules } = validateOptions(options);

  return linariaPreset(babel, {
    babelOptions,
    rules: evaluationRules,
  } as PluginOptions);
}
