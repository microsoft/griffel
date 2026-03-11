/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type { Node } from 'oxc-parser';

import { peek } from './utils.js';
import type { VisitorKeys } from './utils.js';
import type { IdentifierNode } from './ast.js';
import { isMemberExpression, FLIPPED_ALIAS_KEYS } from './ast.js';
import type { GraphBuilder } from './graphBuilder.js';
import { identifierHandlers as core } from './langs/core.js';
import ScopeManager from './scope.js';
import type { IdentifierHandlerType, NodeType } from './types.js';

type HandlerFn = <TParent extends Node = Node>(
  builder: GraphBuilder,
  node: IdentifierNode,
  parent: TParent,
  parentKey: VisitorKeys<TParent>,
  listIdx: number | null,
) => void;

type Handler = IdentifierHandlerType | HandlerFn;

const handlers: {
  [key: string]: Handler;
} = {};

function isAlias(type: NodeType): type is keyof typeof FLIPPED_ALIAS_KEYS {
  return type in FLIPPED_ALIAS_KEYS;
}

export function defineHandler(typeOrAlias: NodeType, field: string, handler: Handler) {
  const types = isAlias(typeOrAlias) ? FLIPPED_ALIAS_KEYS[typeOrAlias] : [typeOrAlias];
  types.forEach((type: string) => {
    handlers[`${type}:${field}`] = handler;
  });
}

export function batchDefineHandlers(typesAndFields: [NodeType, ...string[]][], handler: IdentifierHandlerType) {
  typesAndFields.forEach(([type, ...fields]) => fields.forEach(field => defineHandler(type, field, handler)));
}

batchDefineHandlers([...core.declare], 'declare');

batchDefineHandlers([...core.keep], 'keep');

batchDefineHandlers([...core.refer], 'refer');

/*
 * Special case for FunctionDeclaration
 * Function id should be defined in the parent scope
 */
defineHandler('FunctionDeclaration', 'id', (builder: GraphBuilder, node: IdentifierNode) => {
  builder.scope.declare(node, false, null, 1);
});

/*
 * Special case for ClassDeclaration
 * Class id should be defined in the parent scope (same as FunctionDeclaration)
 */
defineHandler('ClassDeclaration', 'id', (builder: GraphBuilder, node: IdentifierNode) => {
  builder.scope.declare(node, false, null, 1);
});

/*
 * Special case for MethodDefinition/PropertyDefinition keys
 * The key identifier is alive when the definition is alive.
 */
defineHandler('MethodDefinition', 'key', (builder: GraphBuilder, node: IdentifierNode, parent: Node) => {
  builder.graph.addEdge(parent, node);
});

defineHandler('PropertyDefinition', 'key', (builder: GraphBuilder, node: IdentifierNode, parent: Node) => {
  builder.graph.addEdge(parent, node);
});

/*
 * Special handler for [obj.member = 42] = [1] in different contexts
 */
const memberExpressionObjectHandler = (builder: GraphBuilder, node: IdentifierNode) => {
  const context = peek(builder.context);
  const declaration = builder.scope.addReference(node);
  if (declaration) {
    builder.graph.addEdge(node, declaration);

    if (context === 'lval') {
      // One exception here: we shake exports,
      // so `exports` does not depend on its members' assignments.
      if (declaration !== ScopeManager.globalExportsIdentifier && declaration !== ScopeManager.globalModuleIdentifier) {
        builder.graph.addEdge(declaration, node);
      }
    }
  }
};

defineHandler('MemberExpression', 'object', memberExpressionObjectHandler);
defineHandler('OptionalMemberExpression', 'object', memberExpressionObjectHandler);

/*
 * Special handler for obj.member and obj[member]
 */
const memberExpressionPropertyHandler = (builder: GraphBuilder, node: IdentifierNode, parent: Node) => {
  if (isMemberExpression(parent) && parent.computed) {
    const declaration = builder.scope.addReference(node);
    // Let's check that it's not a global variable
    if (declaration) {
      // usage of a variable depends on its declaration
      builder.graph.addEdge(node, declaration);

      const context = peek(builder.context);
      if (context === 'lval') {
        // This is an identifier in the left side of an assignment expression and a variable value depends on that.
        builder.graph.addEdge(declaration, node);
      }
    }
  }
};

defineHandler('MemberExpression', 'property', memberExpressionPropertyHandler);
defineHandler('OptionalMemberExpression', 'property', memberExpressionPropertyHandler);

/*
 * Special handler for Property:key — computed keys are references, non-computed are labels.
 */
defineHandler('Property', 'key', (builder: GraphBuilder, node: IdentifierNode, parent: Node) => {
  if ((parent as Node & { computed: boolean }).computed) {
    const declaration = builder.scope.addReference(node);
    if (declaration) {
      builder.graph.addEdge(node, declaration);
    }
  }
  // Non-computed keys are just labels — no action needed (equivalent to 'keep')
});

/*
 * Special handler for Property:value — context-dependent.
 * In object expressions, value identifiers are references.
 * In destructuring patterns (ObjectPattern), value identifiers are declarations.
 */
defineHandler('Property', 'value', (builder: GraphBuilder, node: IdentifierNode, parent: Node) => {
  const grandparent = builder.graph.getParent(parent);
  if (grandparent && grandparent.type === 'ObjectPattern') {
    // Destructuring pattern: the identifier is being declared
    const kindOfDeclaration = builder.meta.get('kind-of-declaration');
    builder.scope.declare(node, kindOfDeclaration === 'var', null);
  } else {
    // Object expression: the identifier is a reference
    const declaration = builder.scope.addReference(node);
    if (declaration) {
      builder.graph.addEdge(node, declaration);

      const context = peek(builder.context);
      if (context === 'lval') {
        builder.graph.addEdge(declaration, node);
      }
    }
  }
});

export default handlers;
