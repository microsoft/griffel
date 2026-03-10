/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type { Node } from 'oxc-parser';

import { isIdentifier, shallowEqual } from './ast.js';
import type { PromisedNode } from './scope.js';
import type ScopeManager from './scope.js';
import { resolveNode } from './scope.js';

type IdentifierNode = Node & { type: 'Identifier'; name: string };
type StringLiteralNode = Node & { type: 'Literal'; value: string };
type MemberExpressionNode = Node & { type: 'MemberExpression'; object: Node; property: Node };
type Action = (this: DepsGraph, a: Node, b: Node) => void;

function addEdge(this: DepsGraph, a: Node, b: Node) {
  if (this.dependencies.has(a) && this.dependencies.get(a)!.has(b)) {
    // edge has been already added
    return;
  }

  this.edges.push([a, b]);
  if (this.dependencies.has(a)) {
    this.dependencies.get(a)!.add(b);
  } else {
    this.dependencies.set(a, new Set([b]));
  }

  if (this.dependents.has(b)) {
    this.dependents.get(b)!.add(a);
  } else {
    this.dependents.set(b, new Set([a]));
  }
}

export default class DepsGraph {
  public readonly imports: Map<string, (IdentifierNode | StringLiteralNode)[]> = new Map();

  public readonly importAliases: Map<IdentifierNode, string> = new Map();

  public readonly importTypes: Map<string, 'wildcard' | 'default' | 'reexport'> = new Map();

  public readonly reexports: Array<IdentifierNode> = [];

  protected readonly parents: WeakMap<Node, Node> = new WeakMap();

  protected readonly edges: Array<[Node, Node]> = [];

  protected readonly exports: Map<string, Node> = new Map();

  protected readonly dependencies: Map<Node, Set<Node>> = new Map();

  protected readonly dependents: Map<Node, Set<Node>> = new Map();

  private actionQueue: Array<[Action, Node | PromisedNode, Node | PromisedNode]> = [];

  private processQueue() {
    if (this.actionQueue.length === 0) {
      return;
    }

    this.actionQueue.forEach(([action, a, b]) => {
      const resolvedA = resolveNode(a);
      const resolvedB = resolveNode(b);
      if (resolvedA && resolvedB) {
        action.call(this, resolvedA, resolvedB);
      }
    });

    this.actionQueue = [];
  }

  private getAllReferences(id: string): (IdentifierNode | MemberExpressionNode)[] {
    const [, name] = id.split(':');
    const declaration = this.scope.getDeclaration(id)!;
    const allReferences: (IdentifierNode | MemberExpressionNode)[] = [
      ...Array.from(this.dependencies.get(declaration) || []),
      ...Array.from(this.dependents.get(declaration) || []),
    ].filter(i => isIdentifier(i) && i.name === name) as IdentifierNode[];
    allReferences.push(declaration);
    return allReferences;
  }

  constructor(protected scope: ScopeManager) {}

  addEdge(dependent: Node | PromisedNode, dependency: Node | PromisedNode) {
    this.actionQueue.push([addEdge, dependent, dependency]);
  }

  addExport(name: string, node: Node) {
    const existed = this.exports.get(name);
    if (existed) {
      // Sometimes export can be defined more than once and in that case we have to keep all export statements
      this.addEdge(node, existed);
    }

    this.exports.set(name, node);
  }

  addParent(node: Node, parent: Node) {
    this.parents.set(node, parent);
  }

  getParent(node: Node): Node | undefined {
    return this.parents.get(node);
  }

  getDependenciesByBinding(id: string) {
    this.processQueue();
    const allReferences = this.getAllReferences(id);
    const dependencies: Node[] = [];
    this.edges.forEach(([a, b]) => {
      if (isIdentifier(a) && allReferences.includes(a)) {
        dependencies.push(b);
      }
    });

    return dependencies;
  }

  getDependentsByBinding(id: string) {
    this.processQueue();
    const allReferences = this.getAllReferences(id);
    const dependents: Node[] = [];
    this.edges.forEach(([a, b]) => {
      if (isIdentifier(b) && allReferences.includes(b)) {
        dependents.push(a);
      }
    });

    return dependents;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  findDependencies(like: Object) {
    this.processQueue();
    return this.edges.filter(([a]) => shallowEqual(a, like as Record<string, unknown>)).map(([, b]) => b);
  }

  findDependents(like: object) {
    this.processQueue();
    return this.edges.filter(([, b]) => shallowEqual(b, like as Record<string, unknown>)).map(([a]) => a);
  }

  getDependencies(nodes: Node[]) {
    this.processQueue();
    const reduced: Node[] = [];
    nodes.forEach(n => reduced.push(...Array.from(this.dependencies.get(n) || [])));
    return reduced;
  }

  getLeaf(name: string): Node | undefined {
    return this.exports.get(name);
  }

  getLeaves(only: string[] | null): Array<Node | undefined> {
    this.processQueue();
    return only ? only.map(name => this.getLeaf(name)) : Array.from(this.exports.values());
  }
}
