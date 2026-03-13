/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type {
  Node,
  ExpressionStatement,
  Function as OxcFunction,
  Class as OxcClass,
  Program,
  BlockStatement,
  TryStatement,
  CatchClause,
  IfStatement,
  WhileStatement,
  SwitchCase,
  SwitchStatement,
  ForStatement,
  ForInStatement,
  ForOfStatement,
  ReturnStatement,
  ThrowStatement,
  BreakStatement,
  ContinueStatement,
  ObjectExpression,
  VariableDeclarator,
  VariableDeclaration,
  SequenceExpression,
  ObjectPattern,
  ArrayPattern,
  AssignmentPattern,
  ImportDeclaration,
  ExportNamedDeclaration,
  ExportDefaultDeclaration,
  ExportAllDeclaration,
  CallExpression,
  LogicalExpression,
  AssignmentExpression,
} from 'oxc-parser';

import { peek } from '../utils.js';
import type { GraphBuilder } from '../graphBuilder.js';
import ScopeManager from '../scope.js';
import type { IdentifierHandlers, Visitors } from '../types.js';
import type { IdentifierNode, MemberExpressionNode } from '../ast.js';
import {
  isIdentifier,
  isStringLiteral,
  isNumericLiteral,
  isMemberExpression,
  isCallExpression,
  isObjectProperty,
  isObjectMethod,
  isSpreadElement,
  isVariableDeclaration,
  isVariableDeclarator,
  isAssignmentExpression,
  isLogicalExpression,
  isSequenceExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isClassDeclaration,
  isProgram,
  isBreakStatement,
  isContinueStatement,
} from '../ast.js';

function isIdentifierWithName(node: Node, name?: string | string[]): node is IdentifierNode {
  return (
    isIdentifier(node) && (name === undefined || (Array.isArray(name) ? name.includes(node.name) : node.name === name))
  );
}

type SideEffect = [
  {
    callee?: (child: Node) => boolean;
    arguments?: (child: Node[]) => boolean;
  },
  (node: CallExpression, state: GraphBuilder) => void,
];

const sideEffects: SideEffect[] = [
  [
    // if the first argument of forEach is required, mark forEach as required
    {
      callee: node => isMemberExpression(node) && isIdentifier(node.property) && node.property.name === 'forEach',
    },
    (node, state) => state.graph.addEdge(node.arguments[0], node),
  ],
];

function getCallee(node: CallExpression): Node {
  if (isSequenceExpression(node.callee) && node.callee.expressions.length === 2) {
    const [first, second] = node.callee.expressions;
    if (isNumericLiteral(first) && first.value === 0) {
      return second;
    }
  }

  return node.callee;
}

function isMethodWithSideEffect(callee: Node | null, state: GraphBuilder): boolean {
  const methods = ['assign', 'defineProperty', 'defineProperties', 'freeze', 'observe'];
  if (
    isMemberExpression(callee) &&
    isIdentifierWithName(callee.object, 'Object') &&
    isIdentifierWithName(callee.property, methods)
  ) {
    // It's something like Object.defineProperty
    return true;
  }

  if (isMemberExpression(callee) && isIdentifierWithName(callee.property, 'default') && isIdentifier(callee.object)) {
    // It looks like a call of imported method. Maybe it's a polyfill for Object's methods?
    const declaration = state.scope.getDeclaration(callee.object);
    if (!declaration || !isIdentifier(declaration)) return false;
    const source = state.graph.importAliases.get(declaration);
    return methods.some(method => `@babel/runtime/helpers/${method}` === source);
  }

  return false;
}

/*
 * Returns nodes which are implicitly affected by specified node
 */
function getAffectedNodes(node: Node, state: GraphBuilder): Node[] {
  // FIXME: this method should be generalized
  const callee = isCallExpression(node) ? getCallee(node) : null;
  if (isCallExpression(node) && isMethodWithSideEffect(callee, state)) {
    const [obj, property] = node.arguments;
    if (!isIdentifier(obj)) {
      return [];
    }

    if (state.scope.getDeclaration(obj) !== ScopeManager.globalExportsIdentifier) {
      return [node.arguments[0]];
    }

    if (isStringLiteral(property)) {
      if (property.value === '__esModule') {
        return [node.arguments[0]];
      }

      state.graph.addExport(property.value, node);
    }
  }

  return [];
}

/*
 * In some cases (such as enums) babel uses CallExpression for object initializations
 * (function (Colors) {
 *   Colors["BLUE"] = "#27509A";
 * })(Colors || (Colors = {}));
 */
function isLazyInit(statement: ExpressionStatement): statement is ExpressionStatement & {
  expression: CallExpression & { arguments: [LogicalExpression & { right: AssignmentExpression }] };
} {
  const { expression } = statement;
  if (!isCallExpression(expression) || expression.arguments.length !== 1) {
    return false;
  }

  const [arg] = expression.arguments;
  if (!isLogicalExpression(arg) || arg.operator !== '||') {
    return false;
  }

  const { left, right } = arg;
  return isIdentifier(left) && isAssignmentExpression(right);
}

export const visitors = {
  ExpressionStatement(this: GraphBuilder, node: ExpressionStatement) {
    this.baseVisit(node);

    this.graph.addEdge(node, node.expression);
    this.graph.addEdge(node.expression, node);

    if (isLazyInit(node)) {
      this.graph.addEdge(node.expression.arguments[0].right, node);
    }
  },

  Function(this: GraphBuilder, node: OxcFunction & { body: NonNullable<OxcFunction['body']> }) {
    const unsubscribe = this.onVisit(descendant => this.graph.addEdge(node, descendant));
    this.baseVisit(node, true); // ignoreDeps=true prevents default dependency resolving
    unsubscribe();

    this.graph.addEdge(node, node.body);

    node.params.forEach(param => this.graph.addEdge(node.body, param));
    if (isFunctionDeclaration(node) && node.id) {
      // `id` is an identifier which depends on the function declaration
      this.graph.addEdge(node.id, node);
    }

    if (isFunctionExpression(node) && node.id !== null && node.id !== undefined) {
      // keep function name in expressions like `const a = function a();`
      this.graph.addEdge(node, node.id);
    }

    if (isFunctionDeclaration(node) && node.id) {
      this.graph.addEdge(node, node.id);
    }
  },

  Class(this: GraphBuilder, node: OxcClass) {
    const unsubscribe = this.onVisit(descendant => this.graph.addEdge(node, descendant));
    this.baseVisit(node, true);
    unsubscribe();

    this.graph.addEdge(node, node.body);

    if (node.superClass) {
      this.graph.addEdge(node, node.superClass);
    }

    if (node.id) {
      this.graph.addEdge(node.id, node);
      this.graph.addEdge(node, node.id);
    }
  },

  Block(this: GraphBuilder, node: Program | BlockStatement) {
    this.baseVisit(node);

    if (isProgram(node)) {
      const exportsDeclaration = this.scope.getDeclaration('global:exports')!;
      this.graph.addEdge(node, exportsDeclaration);
      // In oxc, directives are ExpressionStatement nodes in body with a `directive` field
      node.body.forEach(child => {
        if ((child as { directive?: string }).directive !== undefined) {
          this.graph.addEdge(node, child);
        }
      });
    }
  },

  // oxc represents directives as ExpressionStatement nodes with a `directive` field
  // No separate Directive visitor needed

  TryStatement(this: GraphBuilder, node: TryStatement) {
    this.baseVisit(node);
    [node.handler, node.finalizer].forEach(statement => {
      if (statement) {
        this.graph.addEdge(node.block, statement);
        this.graph.addEdge(statement, node.block);
      }
    });
  },

  CatchClause(this: GraphBuilder, node: CatchClause) {
    this.baseVisit(node);

    this.graph.addEdge(node, node.body);
  },

  IfStatement(this: GraphBuilder, node: IfStatement) {
    this.baseVisit(node);
    this.graph.addEdge(node, node.consequent);
    this.graph.addEdge(node, node.test);
  },

  WhileStatement(this: GraphBuilder, node: WhileStatement) {
    this.baseVisit(node);
    this.graph.addEdge(node, node.test);
  },

  SwitchCase(this: GraphBuilder, node: SwitchCase) {
    this.baseVisit(node);
    node.consequent.forEach(statement => this.graph.addEdge(statement, node));
    if (node.test) {
      this.graph.addEdge(node, node.test);
    }
  },

  SwitchStatement(this: GraphBuilder, node: SwitchStatement) {
    this.baseVisit(node);
    node.cases.forEach(c => this.graph.addEdge(c, node));
    this.graph.addEdge(node, node.discriminant);
  },

  ForStatement(this: GraphBuilder, node: ForStatement) {
    this.baseVisit(node);

    [node.init, node.test, node.update, node.body].forEach(child => {
      if (child) {
        this.graph.addEdge(node, child);
      }
    });
  },

  ForInStatement(this: GraphBuilder, node: ForInStatement) {
    this.baseVisit(node);

    if (node.body) {
      this.graph.addEdge(node, node.body);
      this.graph.addEdge(node.body, node.left);
    }

    this.graph.addEdge(node.left, node.right);
  },

  ForOfStatement(this: GraphBuilder, node: ForOfStatement) {
    this.baseVisit(node);

    if (node.body) {
      this.graph.addEdge(node, node.body);
      this.graph.addEdge(node.body, node.left);
    }

    this.graph.addEdge(node.left, node.right);
  },

  Terminatorless(this: GraphBuilder, node: ReturnStatement | ThrowStatement | BreakStatement | ContinueStatement) {
    this.baseVisit(node);

    if (!(isBreakStatement(node) || isContinueStatement(node)) && node.argument) {
      this.graph.addEdge(node, node.argument);
    }

    const closestFunctionNode = peek(this.fnStack);
    this.graph.addEdge(closestFunctionNode, node);
  },

  ObjectExpression(this: GraphBuilder, node: ObjectExpression) {
    this.context.push('expression');
    this.baseVisit(node);
    node.properties.forEach(prop => {
      this.graph.addEdge(node, prop);
      if (isObjectMethod(prop)) {
        this.graph.addEdge(prop, prop.key);
        this.graph.addEdge(prop, prop.value);
      } else if (isObjectProperty(prop)) {
        this.graph.addEdge(prop, prop.key);
        this.graph.addEdge(prop, prop.value);
      } else if (isSpreadElement(prop)) {
        this.graph.addEdge(prop, prop.argument);
      }
    });
    this.context.pop();
  },

  MemberExpression(this: GraphBuilder, node: MemberExpressionNode) {
    if (this.visit(node.object, node, 'object') !== 'ignore') {
      this.graph.addEdge(node, node.object);
    }

    this.context.push('expression');
    if (this.visit(node.property, node, 'property') !== 'ignore') {
      this.graph.addEdge(node, node.property);
    }
    this.context.pop();

    this.graph.addEdge(node.object, node);

    if (
      isIdentifierWithName(node.object, 'exports') &&
      this.scope.getDeclaration(node.object) === ScopeManager.globalExportsIdentifier
    ) {
      // We treat `exports.something` and `exports['something']` as identifiers in the global scope
      this.graph.addEdge(node, node.object);
      this.graph.addEdge(node, node.property);

      const isLVal = peek(this.context) === 'lval';
      if (isLVal) {
        this.scope.declare(node, false);
      } else {
        const declaration = this.scope.addReference(node);
        this.graph.addEdge(node, declaration);
      }

      return;
    }

    if (
      isIdentifier(node.object) &&
      ((isIdentifier(node.property) && !node.computed) || isStringLiteral(node.property))
    ) {
      // It's simple `foo.bar` or `foo["bar"]` expression. Is it a usage of a required library?
      const declaration = this.scope.getDeclaration(node.object);
      if (isIdentifier(declaration) && this.graph.importAliases.has(declaration)) {
        // It is. We can remember what exactly we use from it.
        const source = this.graph.importAliases.get(declaration)!;
        this.graph.imports.get(source)!.push(node.property as IdentifierNode);
      }
    }
  },

  AssignmentExpression(this: GraphBuilder, node: AssignmentExpression) {
    this.context.push('lval');
    this.visit(node.left, node, 'left');
    this.context.pop();

    this.visit(node.right, node, 'right');

    // The value of an expression depends on the left part.
    this.graph.addEdge(node, node.left);

    // The left part of an assignment depends on the right part.
    this.graph.addEdge(node.left, node.right);

    // At the same time, the left part doesn't make any sense without the whole expression.
    this.graph.addEdge(node.left, node);
  },

  VariableDeclarator(this: GraphBuilder, node: VariableDeclarator) {
    const declared: Array<[IdentifierNode, IdentifierNode | null]> = [];
    this.meta.set('declared', declared);
    const unregister = this.scope.addDeclareHandler((identifier, from) => declared.push([identifier, from]));
    this.baseVisit(node);
    this.meta.delete('declared');
    unregister();

    if (node.init) {
      // If there is an initialization part, the identifier depends on it.
      this.graph.addEdge(node.id, node.init);
    }

    // If we want to evaluate the value of a declared identifier,
    // we need to evaluate the whole expression.
    this.graph.addEdge(node.id, node);

    // If a statement is required itself, an id is also required
    this.graph.addEdge(node, node.id);

    // Connect identifiers declared inside patterns (destructuring) back to the declarator.
    // Without this, destructured identifiers have no edge to their containing declaration,
    // and the declaration gets removed even when the identifiers are alive.
    for (const [identifier] of declared) {
      if (identifier !== (node.id as Node)) {
        this.graph.addEdge(identifier, node);
        if (node.init) {
          this.graph.addEdge(identifier, node.init);
        }
      }
    }
  },

  VariableDeclaration(this: GraphBuilder, node: VariableDeclaration) {
    this.meta.set('kind-of-declaration', node.kind);
    this.baseVisit(node);
    node.declarations.forEach(declaration => this.graph.addEdge(declaration, node));
    this.meta.delete('kind-of-declaration');
  },

  CallExpression(this: GraphBuilder, node: CallExpression) {
    this.baseVisit(node);

    sideEffects.forEach(([conditions, callback]) => {
      if (
        (conditions.callee && !conditions.callee(node.callee)) ||
        (conditions.arguments && !conditions.arguments(node.arguments as unknown as Node[]))
      ) {
        return;
      }

      callback(node, this);
    });

    getAffectedNodes(node, this).forEach(affectedNode => {
      this.graph.addEdge(affectedNode, node);
      if (isIdentifier(affectedNode)) {
        this.graph.addEdge(this.scope.getDeclaration(affectedNode)!, affectedNode);
      }
    });
  },

  SequenceExpression(this: GraphBuilder, node: SequenceExpression) {
    // Sequence value depends on only last expression in the list
    this.baseVisit(node, true);
    if (node.expressions.length > 0) {
      this.graph.addEdge(node, node.expressions[node.expressions.length - 1]);
    }
  },

  /*
   * Pattern nodes (destructuring) — need explicit edges since they're not expressions,
   * so baseVisit doesn't add dependency edges for them.
   */

  ObjectPattern(this: GraphBuilder, node: ObjectPattern) {
    this.baseVisit(node);
    node.properties.forEach(prop => {
      this.graph.addEdge(node, prop);
      if (prop.type === 'RestElement') {
        this.graph.addEdge(prop, prop.argument);
      } else {
        // BindingProperty: connect to key and value
        this.graph.addEdge(prop, prop.key);
        this.graph.addEdge(prop, prop.value);
      }
    });
  },

  ArrayPattern(this: GraphBuilder, node: ArrayPattern) {
    this.baseVisit(node);
    node.elements.forEach(el => {
      if (el) {
        this.graph.addEdge(node, el);
      }
    });
  },

  AssignmentPattern(this: GraphBuilder, node: AssignmentPattern) {
    this.baseVisit(node);
    this.graph.addEdge(node, node.left);
    this.graph.addEdge(node, node.right);
  },

  /*
   * ESM import/export support
   */

  ImportDeclaration(this: GraphBuilder, node: ImportDeclaration) {
    const source = node.source.value;

    if (!this.graph.imports.has(source)) {
      this.graph.imports.set(source, []);
    }

    // Keep the source literal alive when the import is alive
    this.graph.addEdge(node, node.source);

    // Side-effect import: `import 'module'`
    if (node.specifiers.length === 0) {
      return;
    }

    for (const specifier of node.specifiers) {
      const local = (specifier as { local: IdentifierNode }).local;
      this.scope.declare(local, false, null);

      // When local is alive (referenced), keep the ImportDeclaration and specifier alive
      this.graph.addEdge(local, node);
      this.graph.addEdge(local, specifier);
      // Specifier depends on local (so removeDeadCode preserves the local identifier within the specifier)
      this.graph.addEdge(specifier, local);

      if (specifier.type === 'ImportDefaultSpecifier') {
        this.graph.importTypes.set(source, 'default');
        this.graph.imports.get(source)!.push(local);
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        this.graph.importTypes.set(source, 'wildcard');
        this.graph.importAliases.set(local, source);
      } else if (specifier.type === 'ImportSpecifier') {
        const imported = (specifier as { imported: IdentifierNode }).imported;
        this.graph.imports.get(source)!.push(imported);
        // Keep imported alive when local is alive (for the imports map tracking)
        this.graph.addEdge(local, imported);
        this.graph.addEdge(specifier, imported);
      }
    }

    return 'ignore' as const;
  },

  ExportNamedDeclaration(this: GraphBuilder, node: ExportNamedDeclaration) {
    if (node.declaration) {
      // `export const x = ...` or `export function foo() {}`
      this.visit(node.declaration, node, 'declaration');

      if (isVariableDeclaration(node.declaration)) {
        for (const declarator of node.declaration.declarations) {
          if (isVariableDeclarator(declarator) && isIdentifier(declarator.id)) {
            this.graph.addExport(declarator.id.name, node);
            this.graph.addEdge(node, node.declaration);
            // Ensure the declarator is alive when the export is alive
            this.graph.addEdge(node, declarator);
          }
        }
      } else if (isFunctionDeclaration(node.declaration) && node.declaration.id) {
        const id = node.declaration.id as IdentifierNode;
        this.graph.addExport(id.name, node);
        this.graph.addEdge(node, node.declaration);
      } else if (isClassDeclaration(node.declaration) && node.declaration.id) {
        const id = node.declaration.id as IdentifierNode;
        this.graph.addExport(id.name, node);
        this.graph.addEdge(node, node.declaration);
      }

      return 'ignore' as const;
    }

    if (node.source) {
      // Re-export: `export { foo } from 'source'`
      const source = node.source.value;
      if (!this.graph.imports.has(source)) {
        this.graph.imports.set(source, []);
      }

      // Each specifier maps individually so dead specifiers can be pruned
      this.graph.addEdge(node, node.source);
      for (const specifier of node.specifiers) {
        const spec = specifier as { local: IdentifierNode; exported: IdentifierNode };
        this.graph.addExport(spec.exported.name, specifier);
        this.graph.addEdge(specifier, node);
        this.graph.addEdge(specifier, spec.local);
        this.graph.addEdge(specifier, spec.exported);
        this.graph.imports.get(source)!.push(spec.local);
      }

      return 'ignore' as const;
    }

    // `export { foo, bar }`
    for (const specifier of node.specifiers) {
      const spec = specifier as { local: IdentifierNode; exported: IdentifierNode };
      const declaration = this.scope.addReference(spec.local);

      this.graph.addExport(spec.exported.name, specifier);
      this.graph.addEdge(specifier, node);
      this.graph.addEdge(specifier, spec.local);
      this.graph.addEdge(specifier, spec.exported);

      if (declaration) {
        this.graph.addEdge(specifier, declaration);
      }
    }

    return 'ignore' as const;
  },

  ExportDefaultDeclaration(this: GraphBuilder, node: ExportDefaultDeclaration) {
    this.visit(node.declaration, node, 'declaration');
    this.graph.addExport('default', node);
    this.graph.addEdge(node, node.declaration);

    return 'ignore' as const;
  },

  ExportAllDeclaration(this: GraphBuilder, node: ExportAllDeclaration) {
    const source = node.source.value;
    if (!this.graph.imports.has(source)) {
      this.graph.imports.set(source, []);
    }

    this.graph.addEdge(node, node.source);

    if (node.exported) {
      // `export * as ns from "module"` — namespace re-export creates a single named export `ns`,
      // it does NOT pass through individual exports like `export * from "module"` does.
      const name = isIdentifier(node.exported)
        ? node.exported.name
        : (node.exported as unknown as { value: string }).value;

      this.graph.addExport(name, node);
      this.graph.addEdge(node, node.exported);

      this.graph.importTypes.set(source, 'wildcard');
    } else {
      // `export * from "module"` — true wildcard re-export, passes through all exports
      this.graph.importTypes.set(source, 'reexport');
      this.graph.reexports.push(node as unknown as IdentifierNode);
    }

    return 'ignore' as const;
  },
} as Visitors;

export const identifierHandlers: IdentifierHandlers = {
  declare: [
    ['AssignmentPattern', 'left'],
    ['ArrayPattern', 'elements'],
    ['CatchClause', 'param'],
    ['Function', 'params'],
    ['FunctionExpression', 'id'],
    ['ClassExpression', 'id'],
    ['RestElement', 'argument'],
    ['ThrowStatement', 'argument'],
    ['VariableDeclarator', 'id'],
  ],
  keep: [
    // Property:key is handled by a custom handler (computed keys are references, non-computed are labels)
    // ESM: identifiers in import/export specifiers are handled by visitors, not identifier handlers
    ['ImportSpecifier', 'imported', 'local'],
    ['ImportDefaultSpecifier', 'local'],
    ['ImportNamespaceSpecifier', 'local'],
    ['ExportSpecifier', 'local', 'exported'],
    ['ExportDefaultDeclaration', 'declaration'],
  ],
  refer: [
    ['ArrayExpression', 'elements'],
    ['AssignmentExpression', 'left', 'right'],
    ['BinaryExpression', 'left', 'right'],
    ['CallExpression', 'arguments', 'callee'],
    ['ConditionalExpression', 'test', 'consequent', 'alternate'],
    ['ForInStatement', 'right'],
    ['ForOfStatement', 'right'],
    ['Function', 'body'],
    ['IfStatement', 'test'],
    ['LogicalExpression', 'left', 'right'],
    ['NewExpression', 'arguments', 'callee'],
    ['ReturnStatement', 'argument'],
    ['SequenceExpression', 'expressions'],
    ['SpreadElement', 'argument'],
    ['SwitchStatement', 'discriminant'],
    ['TemplateLiteral', 'expressions'],
    ['UnaryExpression', 'argument'],
    ['UpdateExpression', 'argument'],
    ['VariableDeclarator', 'init'],
  ],
};
