import type { Node, Program } from 'oxc-parser';

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
