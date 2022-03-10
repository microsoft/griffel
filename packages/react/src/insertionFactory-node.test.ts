/*
 * @jest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import type { GriffelRenderer } from '@griffel/core';
import * as React from 'react';

import { insertionFactory } from './insertionFactory';

describe('insertionFactory (node)', () => {
  it('does not use insertionEffect', () => {
    const useInsertionEffect = jest.spyOn(React, 'useInsertionEffect');

    const renderer: Partial<GriffelRenderer> = { id: 'a', insertCSSRules: jest.fn() };
    const insertStyles = insertionFactory();

    insertStyles(renderer as GriffelRenderer, { d: ['a'] });

    expect(useInsertionEffect).not.toHaveBeenCalled();
    expect(renderer.insertCSSRules).toHaveBeenCalledTimes(1);
  });
});
