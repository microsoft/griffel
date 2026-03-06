/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type { Aliases, Node } from '@babel/types';

import type { VisitorKeys } from './utils.js';

export type NodeOfType<T> = Extract<Node, { type: T }>;

export type NodeType = Node['type'] | keyof Aliases;

export type VisitorAction = 'ignore' | void;

export type Visitor<TNode extends Node> = <TParent extends Node>(
  node: TNode,
  parent: TParent | null,
  parentKey: VisitorKeys<TParent> | null,
  listIdx: number | null,
) => VisitorAction;

export type Visitors = { [TMethod in NodeType]?: Visitor<NodeOfType<TMethod>> };

export type IdentifierHandlerType = 'declare' | 'keep' | 'refer';

export type IdentifierHandlers = {
  [key in IdentifierHandlerType]: [NodeType, ...string[]][];
};
