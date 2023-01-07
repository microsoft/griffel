import type { TransformOptions } from '@babel/core';
import type { EvalRule } from '@linaria/utils';

export type BabelPluginOptions = {
  /**
   * If you need to specify custom Babel configuration, you can pass them here. These options will be used by the
   * transformPlugin when parsing and evaluating modules.
   */
  babelOptions?: Pick<TransformOptions, 'plugins' | 'presets'>;

  /** The set of rules that defines how the matched files will be transformed during the evaluation. */
  evaluationRules?: EvalRule[];
};
