/**
 * AST type guards and utilities for oxc-parser AST.
 * Replaces usage of `import { types as t } from '@babel/core'`.
 *
 * At runtime, oxc-parser uses ESTree-style type names:
 * - `Literal` instead of StringLiteral/NumericLiteral/BooleanLiteral
 * - `Property` instead of ObjectProperty/ObjectMethod
 */

import type { Node, Program, StringLiteral, NumericLiteral, BooleanLiteral, NullLiteral } from 'oxc-parser';
import { visitorKeys } from 'oxc-parser';

// Re-export visitorKeys as VISITOR_KEYS for compatibility
export const VISITOR_KEYS: Record<string, string[]> = visitorKeys;

// --- Type guards for individual node types ---

export function isIdentifier(node: unknown): node is Node & { type: 'Identifier'; name: string } {
  return isNodeLike(node) && node.type === 'Identifier';
}

export function isStringLiteral(node: unknown): node is StringLiteral {
  return isNodeLike(node) && node.type === 'Literal' && typeof (node as StringLiteral).value === 'string';
}

export function isNumericLiteral(node: unknown): node is NumericLiteral {
  return isNodeLike(node) && node.type === 'Literal' && typeof (node as NumericLiteral).value === 'number';
}

export function isBooleanLiteral(node: unknown): node is BooleanLiteral {
  return isNodeLike(node) && node.type === 'Literal' && typeof (node as BooleanLiteral).value === 'boolean';
}

export function isNullLiteral(node: unknown): node is NullLiteral {
  return isNodeLike(node) && node.type === 'Literal' && (node as NullLiteral).value === null;
}

export function isMemberExpression(
  node: unknown,
): node is Node & { type: 'MemberExpression'; object: Node; property: Node; computed: boolean } {
  return isNodeLike(node) && node.type === 'MemberExpression';
}

export function isCallExpression(
  node: unknown,
): node is Node & { type: 'CallExpression'; callee: Node; arguments: Node[] } {
  return isNodeLike(node) && node.type === 'CallExpression';
}

export function isObjectExpression(node: unknown): node is Node & { type: 'ObjectExpression'; properties: Node[] } {
  return isNodeLike(node) && node.type === 'ObjectExpression';
}

// oxc uses type: "Property" for both object properties and methods
export function isObjectProperty(
  node: unknown,
): node is Node & { type: 'Property'; key: Node; value: Node; method: boolean; shorthand: boolean; computed: boolean } {
  return isNodeLike(node) && node.type === 'Property' && !(node as { method?: boolean }).method;
}

export function isObjectMethod(
  node: unknown,
): node is Node & { type: 'Property'; key: Node; value: Node; method: true } {
  return isNodeLike(node) && node.type === 'Property' && (node as { method?: boolean }).method === true;
}

export function isSpreadElement(node: unknown): node is Node & { type: 'SpreadElement'; argument: Node } {
  return isNodeLike(node) && node.type === 'SpreadElement';
}

export function isVariableDeclaration(
  node: unknown,
): node is Node & { type: 'VariableDeclaration'; kind: string; declarations: Node[] } {
  return isNodeLike(node) && node.type === 'VariableDeclaration';
}

export function isVariableDeclarator(
  node: unknown,
): node is Node & { type: 'VariableDeclarator'; id: Node; init: Node | null } {
  return isNodeLike(node) && node.type === 'VariableDeclarator';
}

export function isAssignmentExpression(
  node: unknown,
): node is Node & { type: 'AssignmentExpression'; operator: string; left: Node; right: Node } {
  return isNodeLike(node) && node.type === 'AssignmentExpression';
}

export function isLogicalExpression(
  node: unknown,
): node is Node & { type: 'LogicalExpression'; operator: string; left: Node; right: Node } {
  return isNodeLike(node) && node.type === 'LogicalExpression';
}

export function isSequenceExpression(
  node: unknown,
): node is Node & { type: 'SequenceExpression'; expressions: Node[] } {
  return isNodeLike(node) && node.type === 'SequenceExpression';
}

export function isUnaryExpression(
  node: unknown,
): node is Node & { type: 'UnaryExpression'; operator: string; argument: Node } {
  return isNodeLike(node) && node.type === 'UnaryExpression';
}

export function isExpressionStatement(node: unknown): node is Node & { type: 'ExpressionStatement'; expression: Node } {
  return isNodeLike(node) && node.type === 'ExpressionStatement';
}

export function isProgram(node: unknown): node is Program {
  return isNodeLike(node) && node.type === 'Program';
}

export function isFunctionDeclaration(
  node: unknown,
): node is Node & { type: 'FunctionDeclaration'; id: Node | null; params: Node[]; body: Node } {
  return isNodeLike(node) && node.type === 'FunctionDeclaration';
}

export function isFunctionExpression(
  node: unknown,
): node is Node & { type: 'FunctionExpression'; id: Node | null; params: Node[]; body: Node } {
  return isNodeLike(node) && node.type === 'FunctionExpression';
}

export function isArrowFunctionExpression(node: unknown): node is Node & { type: 'ArrowFunctionExpression' } {
  return isNodeLike(node) && node.type === 'ArrowFunctionExpression';
}

export function isClassDeclaration(
  node: unknown,
): node is Node & { type: 'ClassDeclaration'; id: Node | null; body: Node; superClass: Node | null } {
  return isNodeLike(node) && node.type === 'ClassDeclaration';
}

export function isBreakStatement(node: unknown): node is Node & { type: 'BreakStatement' } {
  return isNodeLike(node) && node.type === 'BreakStatement';
}

export function isContinueStatement(node: unknown): node is Node & { type: 'ContinueStatement' } {
  return isNodeLike(node) && node.type === 'ContinueStatement';
}

export function isReturnStatement(node: unknown): node is Node & { type: 'ReturnStatement'; argument: Node | null } {
  return isNodeLike(node) && node.type === 'ReturnStatement';
}

export function isBlockStatement(node: unknown): node is Node & { type: 'BlockStatement'; body: Node[] } {
  return isNodeLike(node) && node.type === 'BlockStatement';
}

// --- Alias-based type guards ---

const EXPRESSION_TYPES = new Set([
  'Identifier',
  'Literal',
  'MemberExpression',
  'CallExpression',
  'NewExpression',
  'ArrayExpression',
  'ObjectExpression',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'AssignmentExpression',
  'BinaryExpression',
  'LogicalExpression',
  'ConditionalExpression',
  'UnaryExpression',
  'UpdateExpression',
  'SequenceExpression',
  'TemplateLiteral',
  'TaggedTemplateExpression',
  'ThisExpression',
  'Super',
  'YieldExpression',
  'AwaitExpression',
  'MetaProperty',
  'SpreadElement',
  'ClassExpression',
  'ChainExpression',
  'ParenthesizedExpression',
  'ImportExpression',
  'V8IntrinsicExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
  'TSInstantiationExpression',
]);

const STATEMENT_TYPES = new Set([
  'BlockStatement',
  'BreakStatement',
  'ContinueStatement',
  'DebuggerStatement',
  'DoWhileStatement',
  'EmptyStatement',
  'ExpressionStatement',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'IfStatement',
  'LabeledStatement',
  'ReturnStatement',
  'SwitchStatement',
  'ThrowStatement',
  'TryStatement',
  'WhileStatement',
  'WithStatement',
  // Declarations (subset of Statement)
  'VariableDeclaration',
  'FunctionDeclaration',
  'ClassDeclaration',
  // Module declarations
  'ImportDeclaration',
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
  'ExportAllDeclaration',
]);

// Types that create a new scope
const SCOPABLE_TYPES = new Set([
  'Program',
  'BlockStatement',
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'CatchClause',
  'SwitchStatement',
  'ClassDeclaration',
  'ClassExpression',
]);

const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

export function isExpression(node: unknown): boolean {
  return isNodeLike(node) && EXPRESSION_TYPES.has(node.type);
}

export function isStatement(node: unknown): boolean {
  return isNodeLike(node) && STATEMENT_TYPES.has(node.type);
}

export function isScopable(node: unknown): boolean {
  return isNodeLike(node) && SCOPABLE_TYPES.has(node.type);
}

export function isFunction(
  node: unknown,
): node is Node & { type: 'FunctionDeclaration' | 'FunctionExpression' | 'ArrowFunctionExpression' } {
  return isNodeLike(node) && FUNCTION_TYPES.has(node.type);
}

// "Block" in Babel = Program | BlockStatement
export function isBlock(node: unknown): node is Node & { type: 'Program' | 'BlockStatement'; body: Node[] } {
  return isProgram(node) || isBlockStatement(node);
}

// --- Alias maps (replacement for t.ALIAS_KEYS / t.FLIPPED_ALIAS_KEYS) ---

export const ALIAS_KEYS: Record<string, string[]> = {};

export const FLIPPED_ALIAS_KEYS: Record<string, string[]> = {
  Class: ['ClassDeclaration', 'ClassExpression'],
  Function: ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'],
  Expression: Array.from(EXPRESSION_TYPES),
  Statement: Array.from(STATEMENT_TYPES),
  Scopable: Array.from(SCOPABLE_TYPES),
  Block: ['Program', 'BlockStatement'],
  Terminatorless: ['ReturnStatement', 'ThrowStatement', 'BreakStatement', 'ContinueStatement'],
};

// Build ALIAS_KEYS from FLIPPED_ALIAS_KEYS
for (const [alias, types] of Object.entries(FLIPPED_ALIAS_KEYS)) {
  for (const type of types) {
    if (!ALIAS_KEYS[type]) ALIAS_KEYS[type] = [];
    ALIAS_KEYS[type].push(alias);
  }
}

// --- Utility functions ---

function isNodeLike(obj: unknown): obj is { type: string; start: number; end: number } {
  return typeof obj === 'object' && obj !== null && typeof (obj as { type?: unknown }).type === 'string';
}

export function isNode(obj: unknown): obj is Node {
  return isNodeLike(obj);
}

/**
 * Shallow comparison of AST nodes by matching specified properties.
 * Replacement for `t.shallowEqual()`.
 */
export function shallowEqual(node: Node, match: Record<string, unknown>): boolean {
  for (const key of Object.keys(match)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((node as any)[key] !== match[key]) {
      return false;
    }
  }
  return true;
}

/**
 * Create a simple identifier node. Used for global sentinel identifiers in scope tracking.
 */
export function createIdentifier(name: string): Node & { type: 'Identifier'; name: string } {
  return { type: 'Identifier', name, start: -1, end: -1 } as Node & { type: 'Identifier'; name: string };
}
