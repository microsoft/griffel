import type { Node, Program } from 'oxc-parser';

// Types from @linaria/babel-preset, internalized to remove the dependency

export type EvaluatorResult = {
  code: string;
  imports: Map<string, string[]> | null;
  moduleKind: 'esm' | 'cjs';
};

export type EvalRule = {
  test?: RegExp | ((path: string) => boolean);
  action: Evaluator | 'ignore' | string;
};

export type Evaluator = (
  filename: string,
  text: string,
  only: string[] | null,
) => EvaluatorResult;

// Griffel-specific types

export interface TransformPerfIssue {
  type: 'cjs-module' | 'barrel-export-star';
  /** The dependency file that caused the issue */
  dependencyFilename: string;
}

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
   * Evaluate an AST node. Return DEOPT symbol to signal "can't handle this".
   */
  evaluateNode: (node: Node, context: AstEvaluatorContext) => unknown;
}
