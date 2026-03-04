// Re-exporting types from @linaria/babel-preset to avoid consumers having to install it directly

export { default as shakerEvaluator } from '@linaria/shaker';
export { EvalCache, Module } from '@linaria/babel-preset';

export type { Evaluator, EvalRule } from '@linaria/babel-preset';

// Our APIs

export { transformSync, type TransformOptions, type TransformResult } from './transformSync.mjs';
export { DeoptError } from './evaluation/astEvaluator.mjs';
export type { AstEvaluatorPlugin, AstEvaluatorContext } from './evaluation/types.mjs';
export { fluentTokensPlugin } from './evaluation/fluentTokensPlugin.mjs';
