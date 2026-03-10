/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type { Node } from 'oxc-parser';

import { peek, warn } from './utils.js';
import type { VisitorKeys } from './utils.js';
import { isIdentifier, ALIAS_KEYS } from './ast.js';
import type GraphBuilderState from './GraphBuilderState.js';
import identifierHandlers from './identifierHandlers.js';
import { visitors as core } from './langs/core.js';
import type { Visitor, Visitors } from './types.js';

type IdentifierNode = Node & { type: 'Identifier'; name: string };

const visitors = {
  Identifier<TParent extends Node>(
    this: GraphBuilderState,
    node: IdentifierNode,
    parent: TParent | null,
    parentKey: VisitorKeys<TParent> | null,
    listIdx: number | null = null,
  ) {
    if (!parent || !parentKey) {
      return;
    }

    const handler = identifierHandlers[`${parent.type}:${parentKey}`];

    if (typeof handler === 'function') {
      handler(this, node, parent, parentKey, listIdx);
      return;
    }

    if (handler === 'keep') {
      return;
    }

    if (handler === 'declare') {
      const kindOfDeclaration = this.meta.get('kind-of-declaration');
      this.scope.declare(node, kindOfDeclaration === 'var', null);
      return;
    }

    if (handler === 'refer') {
      const declaration = this.scope.addReference(node);
      // Let's check that it's not a global variable
      if (declaration) {
        // usage of a variable depends on its declaration
        this.graph.addEdge(node, declaration);

        const context = peek(this.context);
        if (context === 'lval') {
          // This is an identifier in the left side of an assignment expression and a variable value depends on that.
          this.graph.addEdge(declaration, node);
        }
      }

      return;
    }

    /*
     * There is an unhandled identifier.
     * This case should be added to ./identifierHandlers.ts
     */
    warn(
      'evaluator:shaker',
      'Unhandled identifier',
      isIdentifier(node) ? node.name : '(unknown)',
      parent.type,
      parentKey,
      listIdx,
    );
  },

  ...core,
} as Visitors;

const isKeyOfVisitors = (type: string): type is string & keyof Visitors => type in visitors;

export function getVisitors<TNode extends Node>(node: TNode): Visitor<TNode>[] {
  const aliases = ALIAS_KEYS[node.type] || [];
  const aliasVisitors = aliases
    .map(type => (isKeyOfVisitors(type) ? visitors[type] : null))
    .filter(i => i) as Visitor<TNode>[];
  return [...aliasVisitors, visitors[node.type] as Visitor<TNode>].filter(v => v);
}

export default visitors;
