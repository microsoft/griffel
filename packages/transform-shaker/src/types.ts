/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type { Node } from 'oxc-parser';

import type { VisitorKeys } from './utils.js';
import { ALIAS_KEYS } from './ast.js';

export type NodeType = Node['type'] | keyof typeof ALIAS_KEYS | string;

export type VisitorAction = 'ignore' | void;

export type Visitor<TNode extends Node> = <TParent extends Node>(
  node: TNode,
  parent: TParent | null,
  parentKey: VisitorKeys<TParent> | null,
  listIdx: number | null,
) => VisitorAction;

export type Visitors = { [type: string]: Visitor<Node> };

export type IdentifierHandlerType = 'declare' | 'keep' | 'refer';

export type IdentifierHandlers = {
  [key in IdentifierHandlerType]: [NodeType, ...string[]][];
};
