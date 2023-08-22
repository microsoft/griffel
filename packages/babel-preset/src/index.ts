import { transformPlugin } from './transformPlugin';

import type { ConfigAPI } from '@babel/core';
import type { BabelPluginOptions, GriffelHookEntries, GriffelResetHookEntries, BabelPluginMetadata } from './types';

export { default as shakerEvaluator } from '@linaria/shaker';
export { EvalCache, Module } from '@linaria/babel-preset';
export { configSchema } from './schema';

export type { Evaluator, EvalRule } from '@linaria/babel-preset';
export type { BabelPluginOptions, GriffelHookEntries, GriffelResetHookEntries, BabelPluginMetadata };

export default function griffelPreset(babel: ConfigAPI, options: BabelPluginOptions) {
  return {
    plugins: [[transformPlugin, options]],
  };
}
