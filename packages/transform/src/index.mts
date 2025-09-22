// Re-exporting types from @linaria/babel-preset to avoid consumers having to install it directly

export { default as shakerEvaluator } from '@linaria/shaker';
export { EvalCache, Module } from '@linaria/babel-preset';

export type { Evaluator, EvalRule } from '@linaria/babel-preset';

// Our APIs

export { transformSync, type TransformOptions, type TransformResult } from './transformSync.mjs';

// Utility functions
export { shouldTransformSourceCode } from './utils/shouldTransformSourceCode.mjs';
export { generateCSSRules } from './utils/generateCSSRules.mjs';
