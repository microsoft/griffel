/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type { Node } from 'oxc-parser';

import { peek } from '../utils.js';
import type DepsGraph from '../DepsGraph.js';
import type GraphBuilderState from '../GraphBuilderState.js';
import ScopeManager from '../scope.js';
import type { IdentifierHandlers, Visitors } from '../types.js';
import {
  isIdentifier,
  isStringLiteral,
  isNumericLiteral,
  isMemberExpression,
  isCallExpression,
  isObjectExpression,
  isObjectProperty,
  isObjectMethod,
  isSpreadElement,
  isVariableDeclaration,
  isVariableDeclarator,
  isAssignmentExpression,
  isLogicalExpression,
  isSequenceExpression,
  isExpressionStatement,
  isFunctionDeclaration,
  isFunctionExpression,
  isProgram,
  isBreakStatement,
  isContinueStatement,
} from '../ast.js';

type IdentifierNode = Node & { type: 'Identifier'; name: string };
type AssignmentExpressionNode = Node & { type: 'AssignmentExpression'; left: Node; right: Node };
type CallExpressionNode = Node & { type: 'CallExpression'; callee: Node; arguments: Node[] };
type MemberExpressionNode = Node & {
  type: 'MemberExpression';
  object: Node;
  property: Node;
  computed: boolean;
};

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
  (node: CallExpressionNode, state: GraphBuilderState) => void,
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

function getCallee(node: CallExpressionNode): Node {
  if (isSequenceExpression(node.callee) && node.callee.expressions.length === 2) {
    const [first, second] = node.callee.expressions;
    if (isNumericLiteral(first) && first.value === 0) {
      return second;
    }
  }

  return node.callee;
}

function isTSLib(node: Node, scope: ScopeManager) {
  if (!isIdentifier(node)) {
    return false;
  }

  const declaration = scope.getDeclaration(node);
  return isIdentifier(declaration) && declaration.name === 'tslib_1';
}

function isTSReexport(
  node: Node,
  scope: ScopeManager,
): node is CallExpressionNode & { callee: MemberExpressionNode & { object: IdentifierNode } } {
  if (!isCallExpression(node)) {
    return false;
  }

  const {
    callee,
    arguments: [, exportsIdentifier],
  } = node;
  if (
    !isIdentifier(exportsIdentifier) ||
    exportsIdentifier.name !== 'exports' ||
    scope.getDeclaration(exportsIdentifier) !== ScopeManager.globalExportsIdentifier
  ) {
    return false;
  }

  if (!isMemberExpression(callee)) {
    return false;
  }

  const { object, property } = callee;
  if (!isIdentifier(property) || property.name !== '__exportStar') {
    return false;
  }

  return isTSLib(object, scope);
}

function findWildcardReexportStatement(
  node: CallExpressionNode,
  identifierName: string,
  graph: DepsGraph,
): Node | null {
  if (!isIdentifier(node.callee) || node.callee.name !== 'require') return null;

  const declarator = graph.getParent(node);
  if (!isVariableDeclarator(declarator)) return null;

  const declaration = graph.getParent(declarator);
  if (!isVariableDeclaration(declaration)) return null;

  const program = graph.getParent(declaration);
  if (!isProgram(program)) return null;

  // Our node is a correct export
  // Let's check that we have something that looks like transpiled re-export
  return (
    program.body.find(statement => {
      /*
       * We are looking for `Object.keys(_bar).forEach(…)`
       */

      if (!isExpressionStatement(statement)) return false;

      const { expression } = statement;
      if (!isCallExpression(expression)) return false;

      const { callee } = expression;
      if (!isMemberExpression(callee)) return false;

      const { object, property } = callee;

      if (!isIdentifierWithName(property, 'forEach')) return false;

      if (!isCallExpression(object)) return false;

      // `object` should be `Object.keys`
      if (
        !isMemberExpression(object.callee) ||
        !isIdentifierWithName(object.callee.object, 'Object') ||
        !isIdentifierWithName(object.callee.property, 'keys')
      )
        return false;

      //
      const [argument] = object.arguments;
      return isIdentifierWithName(argument, identifierName);
    }) ?? null
  );
}

function isMethodWithSideEffect(callee: Node | null, state: GraphBuilderState): boolean {
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
function getAffectedNodes(node: Node, state: GraphBuilderState): Node[] {
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
function isLazyInit(statement: Node & { type: 'ExpressionStatement'; expression: Node }): statement is Node & {
  type: 'ExpressionStatement';
  expression: CallExpressionNode & { arguments: [Node & { right: AssignmentExpressionNode }] };
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

export const visitors: Visitors = {
  ExpressionStatement(this: GraphBuilderState, node: Node & { type: 'ExpressionStatement'; expression: Node }) {
    this.baseVisit(node);

    this.graph.addEdge(node, node.expression);
    this.graph.addEdge(node.expression, node);

    if (isLazyInit(node)) {
      this.graph.addEdge(node.expression.arguments[0].right, node);
    }
  },

  Function(this: GraphBuilderState, node: Node & { id?: Node | null; params: Node[]; body: Node }) {
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

  Block(this: GraphBuilderState, node: Node & { body: Node[]; directives?: Node[] }) {
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

  TryStatement(this: GraphBuilderState, node: Node & { block: Node; handler: Node | null; finalizer: Node | null }) {
    this.baseVisit(node);
    [node.handler, node.finalizer].forEach(statement => {
      if (statement) {
        this.graph.addEdge(node.block, statement);
        this.graph.addEdge(statement, node.block);
      }
    });
  },

  CatchClause(this: GraphBuilderState, node: Node & { body: Node }) {
    this.baseVisit(node);

    this.graph.addEdge(node, node.body);
  },

  IfStatement(this: GraphBuilderState, node: Node & { test: Node; consequent: Node }) {
    this.baseVisit(node);
    this.graph.addEdge(node, node.consequent);
    this.graph.addEdge(node, node.test);
  },

  WhileStatement(this: GraphBuilderState, node: Node & { test: Node }) {
    this.baseVisit(node);
    this.graph.addEdge(node, node.test);
  },

  SwitchCase(this: GraphBuilderState, node: Node & { test: Node | null; consequent: Node[] }) {
    this.baseVisit(node);
    node.consequent.forEach(statement => this.graph.addEdge(statement, node));
    if (node.test) {
      this.graph.addEdge(node, node.test);
    }
  },

  SwitchStatement(this: GraphBuilderState, node: Node & { discriminant: Node; cases: Node[] }) {
    this.baseVisit(node);
    node.cases.forEach(c => this.graph.addEdge(c, node));
    this.graph.addEdge(node, node.discriminant);
  },

  ForStatement(
    this: GraphBuilderState,
    node: Node & { init: Node | null; test: Node | null; update: Node | null; body: Node },
  ) {
    this.baseVisit(node);

    [node.init, node.test, node.update, node.body].forEach(child => {
      if (child) {
        this.graph.addEdge(node, child);
      }
    });
  },

  ForInStatement(this: GraphBuilderState, node: Node & { left: Node; right: Node; body: Node }) {
    this.baseVisit(node);

    if (node.body) {
      this.graph.addEdge(node, node.body);
      this.graph.addEdge(node.body, node.left);
    }

    this.graph.addEdge(node.left, node.right);
  },

  Terminatorless(this: GraphBuilderState, node: Node & { argument?: Node | null }) {
    this.baseVisit(node);

    if (!(isBreakStatement(node) || isContinueStatement(node)) && node.argument) {
      this.graph.addEdge(node, node.argument);
    }

    const closestFunctionNode = peek(this.fnStack);
    this.graph.addEdge(closestFunctionNode, node);
  },

  ObjectExpression(this: GraphBuilderState, node: Node & { properties: Node[] }) {
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

  MemberExpression(this: GraphBuilderState, node: MemberExpressionNode) {
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

  AssignmentExpression(this: GraphBuilderState, node: AssignmentExpressionNode) {
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

  VariableDeclarator(
    this: GraphBuilderState,
    node: Node & { type: 'VariableDeclarator'; id: Node; init: Node | null },
  ) {
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
  },

  VariableDeclaration(
    this: GraphBuilderState,
    node: Node & { type: 'VariableDeclaration'; kind: string; declarations: Node[] },
  ) {
    this.meta.set('kind-of-declaration', node.kind);
    this.baseVisit(node);
    node.declarations.forEach(declaration => this.graph.addEdge(declaration, node));
    this.meta.delete('kind-of-declaration');
  },

  CallExpression(this: GraphBuilderState, node: CallExpressionNode, parent: Node | null) {
    this.baseVisit(node);

    if (isIdentifier(node.callee) && node.callee.name === 'require') {
      // It looks like a module import …
      const scopeId = this.scope.whereIsDeclared(node.callee);
      if (scopeId && scopeId !== 'global') {
        // … but it is just a user defined function
        return;
      }

      const [firstArg] = node.arguments;
      if (!isStringLiteral(firstArg)) {
        // dynamic import? Maybe someday we can do something about it
        return;
      }

      const { value: source } = firstArg;
      const declared = this.meta.get('declared') as Array<[IdentifierNode, IdentifierNode | null]>;
      if (!declared) {
        // Is it a ts reexport?
        // tslib_1.__exportStar(require("./Async"), exports);
        if (parent && isTSReexport(parent, this.scope)) {
          if (!this.graph.imports.has(source)) {
            this.graph.imports.set(source, []);
          }

          this.graph.addEdge((parent.callee as MemberExpressionNode).object, parent);
          this.graph.reexports.push((parent.callee as MemberExpressionNode).object as IdentifierNode);
          this.graph.importTypes.set(source, 'reexport');
        }

        // This is a standalone `require`
        return;
      }

      // Define all declared variables as external dependencies.
      declared.forEach(([local]) => {
        // FIXME: var slugify = require('../slugify').default;
        if (!this.graph.imports.has(source)) {
          this.graph.imports.set(source, []);
        }

        if (parent && isMemberExpression(parent) && isIdentifier(parent.property)) {
          // An imported function is specified right here.
          // eg. require('../slugify').default
          this.graph.imports.get(source)!.push(parent.property);
        } else {
          if (isCallExpression(parent) && isIdentifier(parent.callee) && typeof parent.callee.name === 'string') {
            if (parent.callee.name.startsWith('_interopRequireDefault')) {
              this.graph.importTypes.set(source, 'default');
            } else if (parent.callee.name.startsWith('_interopRequireWildcard')) {
              this.graph.importTypes.set(source, 'wildcard');
            } else {
              // What I've missed?
            }
          }

          // Do we know the type of import?
          if (!this.graph.importTypes.has(source)) {
            // Is it a wildcard reexport? Let's check.
            const statement = findWildcardReexportStatement(node, local.name, this.graph);
            if (statement) {
              this.graph.addEdge(local, statement);
              this.graph.reexports.push(local);
              this.graph.importTypes.set(source, 'reexport');
            }
          }

          // The whole namespace was imported. We will know later, what exactly we need.
          // eg. const slugify = require('../slugify');
          this.graph.importAliases.set(local, source);
        }
      });

      return;
    }

    sideEffects.forEach(([conditions, callback]) => {
      if (
        (conditions.callee && !conditions.callee(node.callee)) ||
        (conditions.arguments && !conditions.arguments(node.arguments))
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

  SequenceExpression(this: GraphBuilderState, node: Node & { expressions: Node[] }) {
    // Sequence value depends on only last expression in the list
    this.baseVisit(node, true);
    if (node.expressions.length > 0) {
      this.graph.addEdge(node, node.expressions[node.expressions.length - 1]);
    }
  },
};

export const identifierHandlers: IdentifierHandlers = {
  declare: [
    ['CatchClause', 'param'],
    ['Function', 'params'],
    ['FunctionExpression', 'id'],
    ['RestElement', 'argument'],
    ['ThrowStatement', 'argument'],
    ['VariableDeclarator', 'id'],
  ],
  keep: [['Property', 'key']],
  refer: [
    ['ArrayExpression', 'elements'],
    ['AssignmentExpression', 'left', 'right'],
    ['BinaryExpression', 'left', 'right'],
    ['CallExpression', 'arguments', 'callee'],
    ['ConditionalExpression', 'test', 'consequent', 'alternate'],
    ['ForInStatement', 'right'],
    ['Function', 'body'],
    ['IfStatement', 'test'],
    ['LogicalExpression', 'left', 'right'],
    ['NewExpression', 'arguments', 'callee'],
    ['Property', 'value'],
    ['ReturnStatement', 'argument'],
    ['SequenceExpression', 'expressions'],
    ['SwitchStatement', 'discriminant'],
    ['UnaryExpression', 'argument'],
    ['UpdateExpression', 'argument'],
    ['VariableDeclarator', 'init'],
  ],
};
