import { describe, it, expect } from 'vitest';
import { createVar, __internal_resolvePlaceholder, __internal_getPlaceholderOwner } from './createVar.js';
import { GRIFFEL_VAR_PLACEHOLDER_PREFIX, GRIFFEL_VAR_PLACEHOLDER_REGEX } from './constants.js';

describe('createVar', () => {
  it('returns a reference whose string coercion starts as a placeholder', () => {
    const v = createVar();
    const coerced = `${v}`;
    expect(coerced.startsWith(GRIFFEL_VAR_PLACEHOLDER_PREFIX)).toBe(true);
    expect(coerced.match(GRIFFEL_VAR_PLACEHOLDER_REGEX)).not.toBeNull();
  });

  it('gives each call a distinct placeholder', () => {
    const a = createVar();
    const b = createVar();
    expect(`${a}`).not.toEqual(`${b}`);
  });

  it('is usable as an object key', () => {
    const v = createVar();
    const obj: Record<string, string> = { [v as unknown as string]: 'blue' };
    expect(Object.keys(obj)[0]).toEqual(`${v}`);
  });

  it('registers its placeholder so it can be resolved by hash', () => {
    const v = createVar();
    const placeholder = `${v}`;
    expect(__internal_getPlaceholderOwner(placeholder)).toBe(v);
  });

  it('mutates its coercion to the resolved name after resolution', () => {
    const v = createVar();
    const placeholder = `${v}`;
    __internal_resolvePlaceholder(placeholder, '--fv-abc-0');
    expect(`${v}`).toEqual('--fv-abc-0');
  });

  it('is idempotent: first resolution wins', () => {
    const v = createVar();
    const placeholder = `${v}`;
    __internal_resolvePlaceholder(placeholder, '--fv-abc-0');
    __internal_resolvePlaceholder(placeholder, '--fv-xyz-7');
    expect(`${v}`).toEqual('--fv-abc-0');
  });
});
