/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type { Node, CallExpression, StringLiteral } from 'oxc-parser';

import { isNode, getVisitorKeys } from './utils.js';
import type { VisitorKeys } from './utils.js';
import DepsGraph from './DepsGraph.js';
import { getVisitors } from './Visitors.js';
import ScopeManager from './scope.js';
import type { VisitorAction, Visitor } from './types.js';
import type { IdentifierNode, AssignmentExpressionNode } from './ast.js';
import {
  isUnaryExpression,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
  isStringLiteral,
  isObjectExpression,
  isObjectProperty,
  isAssignmentExpression,
  isVariableDeclaration,
  isVariableDeclarator,
  isExpression,
  isStatement,
  isScopable,
  isFunction,
  isProgram,
} from './ast.js';

type OnVisitCallback = (n: Node) => void;

const isVoid = (node: Node): boolean => isUnaryExpression(node) && node.operator === 'void';

function isTSExporterCall(node: Node): node is CallExpression & {
  arguments: [StringLiteral, IdentifierNode];
} {
  if (!isCallExpression(node) || node.arguments.length !== 2) {
    return false;
  }

  // FIXME: more precisely check
  return !(!isIdentifier(node.callee) || node.callee.name !== 'exporter');
}

class GraphBuilder {
  static build(root: Node): DepsGraph {
    return new GraphBuilder(root).graph;
  }

  public readonly scope = new ScopeManager();

  public readonly graph = new DepsGraph(this.scope);

  public readonly meta = new Map<string, unknown>();

  protected callbacks: OnVisitCallback[] = [];

  /*
   * For expressions like `{ foo: bar }` we need to now context
   *
   * const obj = { foo: bar };
   * Here context is `expression`, `bar` is a variable which depends from its declaration.
   *
   * const { foo: bar } = obj;
   * Here context is `pattern` and `bar` is a variable declaration itself.
   */
  public readonly context: Array<'expression' | 'lval'> = [];

  public readonly fnStack: Node[] = [];

  public onVisit(callback: OnVisitCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(c => c !== callback);
    };
  }

  constructor(rootNode: Node) {
    this.visit(rootNode, null, null, null);
  }

  private isExportsIdentifier(node: Node) {
    if (isIdentifier(node)) {
      return this.scope.getDeclaration(node) === ScopeManager.globalExportsIdentifier;
    }

    if (isMemberExpression(node)) {
      return (
        isIdentifier(node.property) &&
        node.property.name === 'exports' &&
        isIdentifier(node.object) &&
        this.scope.getDeclaration(node.object) === ScopeManager.globalModuleIdentifier
      );
    }

    return false;
  }

  private isExportsAssignment(node: Node): node is AssignmentExpressionNode {
    if (node && isAssignmentExpression(node) && isMemberExpression(node.left)) {
      if (this.isExportsIdentifier(node.left)) {
        // This is a default export like `module.exports = 42`
        return true;
      }

      if (this.isExportsIdentifier(node.left.object)) {
        // This is a named export like `module.exports.a = 42` or `exports.a = 42`
        return true;
      }
    }

    return false;
  }

  /*
   * Implements a default behaviour for AST-nodes:
   * • visits every child;
   * • if the current node is an Expression node, adds all its children as dependencies.
   *
   * eg. BinaryExpression has children `left` and `right`,
   * both of them are required for evaluating the value of the expression
   */
  baseVisit<TNode extends Node>(node: TNode, ignoreDeps = false) {
    const dependencies: Node[] = [];
    const isExpr = isExpression(node);
    const keys = getVisitorKeys(node);
    keys.forEach(key => {
      // Ignore all types
      if (key === 'typeArguments' || key === 'typeParameters') {
        return;
      }

      const subNode = node[key as keyof TNode];

      if (Array.isArray(subNode)) {
        for (let i = 0; i < subNode.length; i++) {
          const child = subNode[i];
          if (child && this.visit(child, node, key, i) !== 'ignore') {
            dependencies.push(child);
          }
        }
      } else if (isNode(subNode) && this.visit(subNode, node, key) !== 'ignore') {
        dependencies.push(subNode);
      }
    });

    if (isExpr && !ignoreDeps) {
      dependencies.forEach(dep => this.graph.addEdge(node, dep));
    }

    this.callbacks.forEach(callback => callback(node));
  }

  visit<TNode extends Node, TParent extends Node>(
    node: TNode,
    parent: TParent | null,
    parentKey: VisitorKeys<TParent> | null,
    listIdx: number | null = null,
  ): VisitorAction {
    if (parent) {
      this.graph.addParent(node, parent);
    }

    if (this.isExportsAssignment(node) && !this.isExportsAssignment(node.right) && !isVoid(node.right)) {
      if (isMemberExpression(node.left) && (isIdentifier(node.left.property) || isStringLiteral(node.left.property))) {
        if (isIdentifier(node.left.object) && node.left.object.name === 'module') {
          // It's a batch or default export
          if (isObjectExpression(node.right)) {
            // Batch export is a very particular case.
            // Each property of the assigned object is independent named export.
            // We also need to specify all dependencies and call `visit` for every value.
            this.visit(node.left, node, 'left' as VisitorKeys<TNode & AssignmentExpressionNode>);
            node.right.properties.forEach(prop => {
              if (isObjectProperty(prop) && isIdentifier(prop.key)) {
                this.visit(prop.value, prop, 'value');
                this.graph.addExport(prop.key.name, prop);
                this.graph.addEdge(prop, node.right);
                this.graph.addEdge(prop, prop.key);
                this.graph.addEdge(prop.key, prop.value);
              }
            });

            this.graph.addEdge(node.right, node);
            this.graph.addEdge(node, node.left);
          } else {
            this.graph.addExport('default', node);
            this.graph.addEdge(node, node.left);
          }
          // Regardless of whether the node.right is an object expression, this may also be the default export
          this.graph.addExport('default', node);
        } else {
          // it can be either `exports.name` or `exports["name"]`
          const nameNode = node.left.property;
          this.graph.addExport(isStringLiteral(nameNode) ? nameNode.value : (nameNode as IdentifierNode).name, node);
        }
      }
    } else if (isTSExporterCall(node)) {
      const [name, identifier] = node.arguments;
      this.graph.addExport(name.value, node);
      this.graph.addEdge(node, identifier);
    } else if (isVariableDeclaration(node)) {
      // We might be assigning to the exports, eg. `var Padding = exports.Padding = ...`
      // or it might be a sequence and look like var foo = 1, var Name = exports.name = ...
      node.declarations.forEach(declaration => {
        if (isVariableDeclarator(declaration) && declaration.init && isAssignmentExpression(declaration.init)) {
          let currentExpression: Node = declaration.init;
          let addedExport = false;
          const edgesToAdd: Node[] = [];

          // loop through the assignments looking for possible exports
          while (isAssignmentExpression(currentExpression)) {
            edgesToAdd.push(currentExpression);
            if (
              this.isExportsAssignment(currentExpression) &&
              isMemberExpression(currentExpression.left) &&
              (isIdentifier(currentExpression.left.property) || isStringLiteral(currentExpression.left.property))
            ) {
              const nameNode = currentExpression.left.property;
              this.graph.addExport(
                isStringLiteral(nameNode) ? nameNode.value : (nameNode as IdentifierNode).name,
                node,
              );
              addedExport = true;
              edgesToAdd.push(declaration);
              edgesToAdd.push(currentExpression.left);
              edgesToAdd.push(currentExpression.right);
            }

            currentExpression = currentExpression.right;
          }
          if (addedExport) {
            edgesToAdd.forEach(edge => {
              this.graph.addEdge(node, edge);
            });
          }
        }
      });
    }

    const isScopableNode = isScopable(node);
    const isFunctionNode = isFunction(node);

    if (isScopableNode) this.scope.new(isProgram(node) || isFunction(node));
    if (isFunctionNode) this.fnStack.push(node);

    const visitors = getVisitors(node);
    let action: VisitorAction = undefined;
    if (visitors.length > 0) {
      let visitor: Visitor<TNode> | undefined;
      // eslint-disable-next-line no-cond-assign
      while (!action && (visitor = visitors.shift())) {
        const method: Visitor<TNode> = visitor.bind(this);
        action = method(node, parent, parentKey, listIdx);
      }
    } else {
      this.baseVisit(node);
    }

    if (parent && action !== 'ignore' && isStatement(node)) {
      // Statement always depends on its parent
      this.graph.addEdge(node, parent);
    }

    if (isFunctionNode) this.fnStack.pop();
    if (isScopableNode) this.scope.dispose();

    return action;
  }
}

export type { GraphBuilder };
export default GraphBuilder.build;
