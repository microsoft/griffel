import { parseSync, type Node } from 'oxc-parser';
import { walk } from 'oxc-walker';
import { describe, it, expect } from 'vitest';

import type { StyleCall } from '../types.mjs';
import { batchEvaluator } from './batchEvaluator.mjs';
import { fluentTokensPlugin } from './fluentTokensPlugin.mjs';

const babelOptions = {};
const evaluationRules = [
  {
    test: /[/\\]node_modules[/\\]/,
    action: 'ignore' as const,
  },
];

/**
 * Parses source code and extracts StyleCall objects for each makeStyles/makeResetStyles call.
 */
function parseStyleCalls(sourceCode: string): { styleCalls: StyleCall[]; program: ReturnType<typeof parseSync>['program'] } {
  const result = parseSync('/test.ts', sourceCode);

  if (result.errors.length > 0) {
    throw new Error(`Parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  const styleCalls: StyleCall[] = [];

  walk(result.program, {
    enter(node, parent) {
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        (node.callee.name === 'makeStyles' || node.callee.name === 'makeResetStyles')
      ) {
        const argument = node.arguments[0] as Node;

        let declaratorId = 'unknown';
        if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
          declaratorId = parent.id.name;
        }

        styleCalls.push({
          declaratorId,
          functionKind: node.callee.name as 'makeStyles' | 'makeResetStyles',
          argumentStart: argument.start,
          argumentEnd: argument.end,
          argumentCode: sourceCode.slice(argument.start, argument.end),
          argumentNode: argument,
          callStart: node.start,
          callEnd: node.end,
          importId: node.callee.name,
        });
      }
    },
  });

  return { styleCalls, program: result.program };
}

// Stub so that the VM can execute the full source code without errors
const MAKESTYLES_STUB = 'function makeStyles(x) { return x; }\n';

describe('batchEvaluator', () => {
  it('evaluates all calls statically when possible', () => {
    const sourceCode = `
      const a = makeStyles({ root: { color: "red" } });
      const b = makeStyles({ icon: { fontSize: 16 } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(false);
    expect(evaluationResults).toEqual([
      { root: { color: 'red' } },
      { icon: { fontSize: 16 } },
    ]);
  });

  it('falls back to VM for calls with variable references', () => {
    const sourceCode = MAKESTYLES_STUB + `
      const color = "blue";
      const a = makeStyles({ root: { color } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(true);
    expect(evaluationResults).toEqual([
      { root: { color: 'blue' } },
    ]);
  });

  it('handles mix of static and VM calls (static first, VM second)', () => {
    const sourceCode = MAKESTYLES_STUB + `
      const size = 16;
      const a = makeStyles({ root: { color: "red" } });
      const b = makeStyles({ icon: { fontSize: size } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(true);
    expect(evaluationResults).toEqual([
      { root: { color: 'red' } },
      { icon: { fontSize: 16 } },
    ]);
  });

  it('handles mix of static and VM calls (VM first, static second)', () => {
    const sourceCode = MAKESTYLES_STUB + `
      const color = "blue";
      const a = makeStyles({ root: { color } });
      const b = makeStyles({ icon: { fontSize: 16 } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(true);
    expect(evaluationResults).toEqual([
      { root: { color: 'blue' } },
      { icon: { fontSize: 16 } },
    ]);
  });

  it('maps results to correct indices with non-contiguous VM calls', () => {
    const sourceCode = MAKESTYLES_STUB + `
      const color = "blue";
      const size = 20;
      const a = makeStyles({ root: { display: "flex" } });
      const b = makeStyles({ slot: { color } });
      const c = makeStyles({ icon: { padding: 0 } });
      const d = makeStyles({ wrapper: { fontSize: size } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(true);
    expect(evaluationResults).toEqual([
      { root: { display: 'flex' } },
      { slot: { color: 'blue' } },
      { icon: { padding: 0 } },
      { wrapper: { fontSize: 20 } },
    ]);
  });

  it('handles single VM call among multiple static calls', () => {
    const sourceCode = MAKESTYLES_STUB + `
      const spacing = "8px";
      const a = makeStyles({ root: { color: "red" } });
      const b = makeStyles({ icon: { fontSize: 16 } });
      const c = makeStyles({ slot: { padding: spacing } });
      const d = makeStyles({ wrapper: { display: "block" } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(true);
    expect(evaluationResults).toEqual([
      { root: { color: 'red' } },
      { icon: { fontSize: 16 } },
      { slot: { padding: '8px' } },
      { wrapper: { display: 'block' } },
    ]);
  });

  it('handles computed property keys via VM evaluation', () => {
    const sourceCode = MAKESTYLES_STUB + `
      const propName = "--custom-var";
      const a = makeStyles({ root: { color: "red" } });
      const b = makeStyles({ slot: { [propName]: "value" } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(true);
    expect(evaluationResults).toEqual([
      { root: { color: 'red' } },
      { slot: { '--custom-var': 'value' } },
    ]);
  });

  it('uses AST evaluation plugins for static evaluation', () => {
    const sourceCode = `
      const a = makeStyles({ root: { color: tokens.colorNeutralForeground1 } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program, [fluentTokensPlugin],
    );

    expect(usedVMForEvaluation).toBe(false);
    expect(evaluationResults).toEqual([
      { root: { color: 'var(--colorNeutralForeground1)' } },
    ]);
  });

  it('handles all VM calls without static evaluation', () => {
    const sourceCode = MAKESTYLES_STUB + `
      const a = "red";
      const b = 16;
      const x = makeStyles({ root: { color: a } });
      const y = makeStyles({ icon: { fontSize: b } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(true);
    expect(evaluationResults).toEqual([
      { root: { color: 'red' } },
      { icon: { fontSize: 16 } },
    ]);
  });

  it('handles a single call that evaluates statically', () => {
    const sourceCode = `
      const a = makeStyles({ root: { color: "red" } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(false);
    expect(evaluationResults).toEqual([{ root: { color: 'red' } }]);
  });

  it('handles a single call that needs VM', () => {
    const sourceCode = MAKESTYLES_STUB + `
      const color = "red";
      const a = makeStyles({ root: { color } });
    `;

    const { styleCalls, program } = parseStyleCalls(sourceCode);
    const { usedVMForEvaluation, evaluationResults } = batchEvaluator(
      sourceCode, '/test.ts', styleCalls, babelOptions, evaluationRules, program,
    );

    expect(usedVMForEvaluation).toBe(true);
    expect(evaluationResults).toEqual([{ root: { color: 'red' } }]);
  });
});
