/**
 * Utilities inlined from @linaria/babel-preset and @linaria/logger
 * to remove the dependency on @linaria/* packages.
 */

import type { Node } from 'oxc-parser';
import createDebug from 'debug';

import { isNode as isNodeCheck, VISITOR_KEYS } from './ast.js';

// --- From @linaria/babel-preset/utils/isNode ---

export const isNode = isNodeCheck;

// --- From @linaria/babel-preset/utils/getVisitorKeys ---

export type VisitorKeys<T extends Node> = {
  [K in keyof T]: Exclude<T[K], undefined> extends Node | Node[] | null ? K : never;
}[keyof T] &
  string;

export function getVisitorKeys<TNode extends Node>(node: TNode): VisitorKeys<TNode>[] {
  return (VISITOR_KEYS[node.type] ?? []) as VisitorKeys<TNode>[];
}

// --- From @linaria/babel-preset/utils/peek ---

export const peek = <T>(stack: T[], offset = 1): T => stack[stack.length - offset];

// --- From @linaria/logger ---

const linariaDebug = createDebug('griffel:shaker');

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const levels = ['error', 'warn', 'info', 'debug'];
const currentLevel = levels.indexOf(process.env['LINARIA_LOG'] || 'warn');

function log(level: LogLevel, namespaces: string, arg1: unknown | (() => unknown), ...restArgs: unknown[]) {
  if (currentLevel < levels.indexOf(level)) {
    return;
  }

  if (!linariaDebug.enabled) return;

  if (typeof arg1 === 'function') {
    const text = arg1();
    if (text) {
      linariaDebug(`[${namespaces}]`, text, ...restArgs);
    }
    return;
  }

  linariaDebug(`[${namespaces}]`, arg1, ...restArgs);
}

export const debug = log.bind(null, 'debug');
export const warn = log.bind(null, 'warn');

// --- From @linaria/babel-preset types ---

export type EvalRule = {
  test?: RegExp | ((path: string) => boolean);
  action: Evaluator | 'ignore' | string;
};

export type Evaluator = (
  filename: string,
  text: string,
  only: string[] | null,
) => [string, Map<string, string[]> | null];

// --- Invariant utility (replaces ts-invariant) ---

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}
