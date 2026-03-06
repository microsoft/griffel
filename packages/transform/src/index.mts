export { default as shakerEvaluator } from '@griffel/transform-shaker';
export { Module } from './evaluation/module.mjs';
export * as EvalCache from './evaluation/evalCache.mjs';
export { ASSET_TAG_OPEN, ASSET_TAG_CLOSE } from './constants.mjs';

export type { Evaluator, EvalRule } from './evaluation/types.mjs';

// Our APIs

export { transformSync, type TransformOptions, type TransformResult } from './transformSync.mjs';
export { DEOPT, type Deopt } from './evaluation/astEvaluator.mjs';
export type { AstEvaluatorPlugin, AstEvaluatorContext } from './evaluation/types.mjs';
export { fluentTokensPlugin } from './evaluation/fluentTokensPlugin.mjs';
