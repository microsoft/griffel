import { describe, it, expect } from 'vitest';
import { createVar, __internal_getResolvedName } from '../createVar.js';
import { resolveVarsInStyles } from './resolveVarsInStyles.js';
import { VAR_HASH_PREFIX } from '../constants.js';

describe('resolveVarsInStyles', () => {
  it('returns the input unchanged when no placeholders are present', () => {
    const styles = { color: 'red' };
    const result = resolveVarsInStyles(styles, '');
    expect(result).toBe(styles); // same ref — fast path
  });

  it('rewrites a placeholder key to a --fv-* name', () => {
    const colorVar = createVar();
    const styles = { [`${colorVar}`]: 'blue' };
    const result = resolveVarsInStyles(styles, '');

    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
    expect(keys[0].startsWith(`--${VAR_HASH_PREFIX}-`)).toBe(true);
    expect(result[keys[0]]).toEqual('blue');
  });

  it('rewrites placeholders inside string values (e.g. var(--placeholder))', () => {
    const colorVar = createVar();
    const styles = {
      [`${colorVar}`]: 'blue',
      color: `var(${colorVar})`,
    };
    const result = resolveVarsInStyles(styles, '');

    const resolvedName = __internal_getResolvedName(`${colorVar}`);
    expect(resolvedName).toBeDefined();
    expect(result).toEqual({
      [resolvedName!]: 'blue',
      color: `var(${resolvedName})`,
    });
  });

  it('produces the same final output for two identical runs (SSR-equivalence)', () => {
    const v1 = createVar();
    const v2 = createVar();

    const run = (placeholderA: string, placeholderB: string) =>
      resolveVarsInStyles({ [placeholderA]: 'blue', color: `var(${placeholderA})`, [placeholderB]: '10px' }, '');

    const first = run(`${v1}`, `${v2}`);
    const second = run(`${v1}`, `${v2}`);
    expect(Object.keys(second)).toEqual(Object.keys(first));
    expect(second).toEqual(first);
  });

  it('reuses an already-resolved var across blocks (first-definer-wins)', () => {
    const shared = createVar();
    const blockA = { [`${shared}`]: 'red' };
    const blockB = { color: `var(${shared})` };

    const resolvedA = resolveVarsInStyles(blockA, '');
    const resolvedName = Object.keys(resolvedA)[0];

    const resolvedB = resolveVarsInStyles(blockB, '');
    expect(resolvedB.color).toEqual(`var(${resolvedName})`);
  });

  it('handles placeholders nested inside selector blocks', () => {
    const colorVar = createVar();
    const styles = {
      color: `var(${colorVar})`,
      ':hover': {
        [`${colorVar}`]: 'red',
      },
    };
    const result = resolveVarsInStyles(styles, '') as Record<string, unknown>;
    const resolvedName = __internal_getResolvedName(`${colorVar}`);
    expect(result['color']).toEqual(`var(${resolvedName})`);
    expect(result[':hover']).toEqual({ [resolvedName!]: 'red' });
  });
});
