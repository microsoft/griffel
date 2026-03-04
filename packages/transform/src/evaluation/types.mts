import type { Node, Program } from 'oxc-parser';

// Types from @linaria/babel-preset, internalized to remove the dependency

export type Evaluator = (
  filename: string,
  options: StrictOptions,
  text: string,
  only: string[] | null,
) => [string, Map<string, string[]> | null];

export type EvalRule = {
  test?: RegExp | ((path: string) => boolean);
  action: Evaluator | 'ignore' | string;
};

export type StrictOptions = {
  displayName: boolean;
  evaluate: boolean;
  babelOptions: { plugins?: unknown[]; presets?: unknown[]; [key: string]: unknown };
  rules: EvalRule[];
};

// Griffel-specific types

export interface EvaluationResult {
  confident: boolean;
  value?: unknown;
  error?: Error;
}

export interface AstEvaluatorContext {
  /** Full program AST */
  programAst: Program;
  /** Recursive evaluator callback (goes through base + all plugins) */
  evaluateNode: (node: Node) => unknown;
}

export interface AstEvaluatorPlugin {
  name: string;
  /**
   * Evaluate an AST node. Throw DeoptError to signal "can't handle this".
   */
  evaluateNode: (node: Node, context: AstEvaluatorContext) => unknown;
}
