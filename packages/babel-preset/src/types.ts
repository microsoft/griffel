import type { TransformOptions } from '@babel/core';
import type { EvalRule } from '@linaria/babel-preset';

export type BabelPluginOptions = {
  /**
   * Returns the evaluated CSS rules in the file result metadata
   * @default false
   */
  generateMetadata?: boolean;
  /** Defines set of modules and imports handled by a transformPlugin. */
  modules?: {
    moduleSource: string;
    importName: string;
    resetImportName?: string;
  }[];

  /**
   * If you need to specify custom Babel configuration, you can pass them here. These options will be used by the
   * transformPlugin when parsing and evaluating modules.
   */
  babelOptions?: Pick<TransformOptions, 'plugins' | 'presets'>;

  /** The set of rules that defines how the matched files will be transformed during the evaluation. */
  evaluationRules?: EvalRule[];

  /**
   * Defined the of the project. Is used to have a deterministic path for asset paths, usually should be equal to Git
   * root.
   *
   * @default process.cwd()
   */
  projectRoot?: string;
};

type CSSRulesBySlot = Record<string, string[]>;

export type GriffelHookEntries = Record<string, CSSRulesBySlot>;
export type GriffelResetHookEntries = Record<string, string[]>;

export type BabelPluginMetadata = {
  cssEntries: GriffelHookEntries;
  cssResetEntries: GriffelResetHookEntries;
};
