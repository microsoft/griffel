/*
 * @vitest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { describe, it, test, expect, vi } from 'vitest';
import type { GriffelRenderer } from '@griffel/core';

const { useInsertionEffect } = vi.hoisted(() => ({
  useInsertionEffect: vi.fn(),
}));

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, useInsertionEffect };
});

import { insertionFactory } from './insertionFactory';

describe('insertionFactory (node)', () => {
  it('does not use insertionEffect', () => {
    const renderer: Partial<GriffelRenderer> = { id: 'a', insertCSSRules: vi.fn() };
    const insertStyles = insertionFactory();

    insertStyles(renderer as GriffelRenderer, { d: ['a'] });

    expect(useInsertionEffect).not.toHaveBeenCalled();
    expect(renderer.insertCSSRules).toHaveBeenCalledTimes(1);
  });
});
