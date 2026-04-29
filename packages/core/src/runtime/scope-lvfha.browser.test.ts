// LVFHA cascade inside `@scope` rules, in a real browser.
// See https://griffel.js.org/react/guides/atomic-css/#lvfha-order-of-pseudo-classes

import { beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import {
  applyStyles,
  COLORS,
  commands,
  getComputedBackgroundColor,
  getColor,
  render,
  resetBrowserTestState,
} from '../common/browserHelpers.js';

beforeEach(resetBrowserTestState);

describe('LVHA cascade inside @scope', () => {
  test('@scope :hover wins over @scope :focus (authored hover-first)', async () => {
    const { root } = applyStyles({
      root: {
        '@scope to (.never)': {
          ':hover': { background: 'cyan' },
          ':focus': { background: 'yellow' },
        },
      },
    });
    render(`<button class="${root}" data-testid="btn">scoped hover-first</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.CYAN);
  });

  test('@scope :hover wins over @scope :focus (authored focus-first)', async () => {
    const { root } = applyStyles({
      root: {
        '@scope to (.never)': {
          ':focus': { background: 'yellow' },
          ':hover': { background: 'cyan' },
        },
      },
    });
    render(`<button class="${root}" data-testid="btn">scoped focus-first</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.CYAN);
  });

  test('@scope :active wins over @scope :hover (authored active-first)', async () => {
    const { root } = applyStyles({
      root: {
        '@scope to (.never)': {
          ':active': { background: 'orange' },
          ':hover': { background: 'lightgreen' },
        },
      },
    });
    render(`<button class="${root}" data-testid="btn">scoped active-first</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.ORANGE);

    await commands.mouseUp();
  });

  test('@scope :active wins over @scope :hover (authored hover-first)', async () => {
    const { root } = applyStyles({
      root: {
        '@scope to (.never)': {
          ':hover': { background: 'lightgreen' },
          ':active': { background: 'orange' },
        },
      },
    });
    render(`<button class="${root}" data-testid="btn">scoped hover-before-active</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.ORANGE);

    await commands.mouseUp();
  });
});

describe('@scope vs non-scoped cascade', () => {
  // Per CSS @scope spec, scoped rules win over non-scoped rules at equal
  // specificity due to scope proximity. Griffel currently emits both into
  // the same bucket (e.g. `d`) and relies on the browser's proximity
  // tie-breaker for correctness.
  test('@scope color wins over non-scoped color on the same element', () => {
    const { root } = applyStyles({
      root: {
        '@scope to (.never)': { color: 'blue' },
        color: 'red',
      },
    });
    render(`<div class="${root}" data-testid="el">scope vs default</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.BLUE);
  });
});
