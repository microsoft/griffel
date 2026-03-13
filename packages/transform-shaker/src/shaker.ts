/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 */

import type { Node, Program } from 'oxc-parser';
import MagicString from 'magic-string';

import { isNode, getVisitorKeys, debug } from './utils.js';
import build from './graphBuilder.js';

// Syntactically required children that must not be removed independently —
// removing them produces invalid code (e.g. `export { X }` without `from "module"`).
const STRUCTURAL_CHILDREN: Record<string, Set<string>> = {
  ExportNamedDeclaration: new Set(['source']),
  ExportAllDeclaration: new Set(['source', 'exported']),
  ImportDeclaration: new Set(['source']),
};

function isStatementBody(nodeType: string, key: string): boolean {
  return (
    (nodeType === 'Program' && key === 'body') ||
    (nodeType === 'BlockStatement' && key === 'body') ||
    (nodeType === 'SwitchCase' && key === 'consequent')
  );
}

/*
 * For comma-separated arrays (declarations, properties, etc.),
 * removes dead elements along with their separators.
 */
function removeDeadFromCommaSeparatedArray(s: MagicString, elements: Node[], alive: Set<Node>): void {
  const aliveIndices: number[] = [];
  const deadIndices: number[] = [];

  elements.forEach((el, i) => {
    if (alive.has(el)) {
      aliveIndices.push(i);
    } else {
      deadIndices.push(i);
    }
  });

  if (deadIndices.length === 0 || aliveIndices.length === 0) {
    // All alive or all dead — handled elsewhere
    if (aliveIndices.length === 0) {
      s.remove(elements[0].start, elements[elements.length - 1].end);
    }
    return;
  }

  // Group consecutive dead elements
  const deadGroups: number[][] = [];
  let currentGroup: number[] = [];
  for (const idx of deadIndices) {
    if (currentGroup.length > 0 && idx !== currentGroup[currentGroup.length - 1] + 1) {
      deadGroups.push(currentGroup);
      currentGroup = [];
    }
    currentGroup.push(idx);
  }
  if (currentGroup.length > 0) deadGroups.push(currentGroup);

  for (const group of deadGroups) {
    const firstDead = elements[group[0]];
    const lastDead = elements[group[group.length - 1]];

    const prevAliveIdx = aliveIndices.filter(i => i < group[0]).pop();
    const nextAliveIdx = aliveIndices.find(i => i > group[group.length - 1]);

    if (prevAliveIdx !== undefined) {
      // Remove from previous alive element's end to last dead's end (removes leading comma + dead elements)
      s.remove(elements[prevAliveIdx].end, lastDead.end);
    } else if (nextAliveIdx !== undefined) {
      // Remove from first dead's start to next alive's start (removes dead elements + trailing comma)
      s.remove(firstDead.start, elements[nextAliveIdx].start);
    }
  }
}

/*
 * Removes a dead statement's range, extending to include trailing whitespace and newline.
 */
function removeStatementRange(s: MagicString, sourceCode: string, start: number, end: number): void {
  let extendedEnd = end;
  while (extendedEnd < sourceCode.length && (sourceCode[extendedEnd] === ' ' || sourceCode[extendedEnd] === '\t')) {
    extendedEnd++;
  }
  if (extendedEnd < sourceCode.length && sourceCode[extendedEnd] === '\n') {
    extendedEnd++;
  } else if (extendedEnd < sourceCode.length && sourceCode[extendedEnd] === '\r') {
    extendedEnd++;
    if (extendedEnd < sourceCode.length && sourceCode[extendedEnd] === '\n') {
      extendedEnd++;
    }
  }
  s.remove(start, extendedEnd);
}

/*
 * Recursively removes dead code from the AST using MagicString.
 * For statement arrays (body), dead statements are removed individually.
 * For comma-separated arrays (declarations, properties), dead elements
 * are removed together with their separating commas.
 */
function removeDeadCode(node: Node, alive: Set<Node>, s: MagicString, sourceCode: string): void {
  const keys = getVisitorKeys(node);

  for (const key of keys as string[]) {
    if (key === 'typeArguments' || key === 'typeParameters') continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subNode = (node as any)[key];

    if (Array.isArray(subNode)) {
      const elements = subNode.filter((el: unknown): el is Node => el != null && isNode(el));
      if (elements.length === 0) continue;

      const hasDeadElements = elements.some(el => !alive.has(el));

      if (!hasDeadElements) {
        // All alive, just recurse
        elements.forEach(el => removeDeadCode(el, alive, s, sourceCode));
      } else if (isStatementBody(node.type, key)) {
        // Statement arrays: remove dead elements individually, recurse into alive
        for (const el of elements) {
          if (!alive.has(el)) {
            removeStatementRange(s, sourceCode, el.start, el.end);
          } else {
            removeDeadCode(el, alive, s, sourceCode);
          }
        }
      } else {
        // Comma-separated arrays: recurse into alive elements first, then remove dead ones
        elements.filter(el => alive.has(el)).forEach(el => removeDeadCode(el, alive, s, sourceCode));
        removeDeadFromCommaSeparatedArray(s, elements, alive);
      }
    } else if (isNode(subNode)) {
      if (alive.has(subNode)) {
        removeDeadCode(subNode, alive, s, sourceCode);
      } else if (!STRUCTURAL_CHILDREN[node.type]?.has(key)) {
        s.remove(subNode.start, subNode.end);
      }
    }
  }
}

const isDefined = <T>(i: T | undefined): i is T => i !== undefined;

/*
 * Gets AST and a list of nodes for evaluation
 * Removes unrelated "dead" code.
 * Returns shaken source code and an array of external dependencies.
 */
export default function shake(
  rootPath: Program,
  sourceCode: string,
  exports: string[] | null,
): [string, Map<string, string[]>] {
  debug('evaluator:shaker:shake', () => `source (exports: ${(exports || []).join(', ')}):\n${sourceCode}`);

  const depsGraph = build(rootPath);
  const alive = new Set<Node>();
  const reexports: string[] = [];
  let deps = (exports ?? [])
    .map(token => {
      if (token === '*') {
        return depsGraph.getLeaves(null).filter(isDefined);
      }

      const node = depsGraph.getLeaf(token);
      if (node) return [node];
      // We have some unknown token. Do we have `export * from …` in that file?
      if (depsGraph.reexports.length === 0) {
        return [];
      }

      // If so, mark all re-exported files as required
      reexports.push(token);
      return [...depsGraph.reexports];
    })
    .reduce<Node[]>((acc, el) => {
      acc.push(...el);
      return acc;
    }, []);
  while (deps.length > 0) {
    // Mark all dependencies as alive
    deps.forEach(d => alive.add(d));

    // Collect new dependencies of dependencies
    deps = depsGraph.getDependencies(deps).filter(d => !alive.has(d));
  }

  const s = new MagicString(sourceCode);
  removeDeadCode(rootPath, alive, s, sourceCode);
  const shakenCode = s.toString();

  debug('evaluator:shaker:shake', `shaken ${alive.size} alive nodes`);

  const imports = new Map<string, string[]>();
  [...depsGraph.imports.entries()].forEach(([source, members]) => {
    const importType = depsGraph.importTypes.get(source);
    const defaultMembers = importType === 'wildcard' ? ['*'] : [];
    const aliveMembers = new Set(
      members
        .filter(i => alive.has(i))
        .map(i =>
          i.type === 'Identifier' ? (i as Node & { name: string }).name : (i as Node & { value: string }).value,
        ),
    );

    if (importType === 'reexport') {
      reexports.forEach(token => aliveMembers.add(token));
    }

    imports.set(source, aliveMembers.size > 0 ? Array.from(aliveMembers) : defaultMembers);
  });

  return [shakenCode, imports];
}
