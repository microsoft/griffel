// Pins `@scope` semantics inside `makeResetStyles` and against `makeStyles`
// in a real browser.
//
// Quick model (continuing from `makeResetStyles.browser.test.ts`):
//   - `@scope (root) to (boundary)` rules match only between `root` and
//     `boundary`. `:scope` selects the root element itself.
//   - At equal specificity, the CSS @scope spec uses scope proximity as a
//     tie-breaker BEFORE source order. So a scoped rule can override a
//     non-scoped rule even when the non-scoped rule appears later in the
//     stylesheet — this is the one case where bucket-order intuition fails.

import { beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { mergeClasses } from '../index.js';
import {
  applyResetStyles,
  applyStyles,
  COLORS,
  getColor,
  getComputedBackgroundColor,
  render,
  resetBrowserTestState,
} from '../common/browserHelpers.js';

beforeEach(resetBrowserTestState);

describe('@scope inside makeResetStyles applies the boundary', () => {
  // Descendants inside the scope (between reset root and `.boundary`) get
  // the scoped rule; descendants past the boundary fall back to non-scoped.
  test('scoped descendant rule applies inside the scope; sibling past the boundary stays default', () => {
    const className = applyResetStyles({
      color: 'black',
      '@scope to (.boundary)': {
        '& p': { color: 'red' },
      },
    });
    render(`
      <div class="${className}" data-testid="root">
        <p data-testid="scoped">inside scope</p>
        <div class="boundary">
          <p data-testid="outside">past boundary</p>
        </div>
      </div>
    `);

    expect(getColor(document.querySelector('[data-testid=scoped]')!)).toBe(COLORS.RED);
    expect(getColor(document.querySelector('[data-testid=outside]')!)).toBe(COLORS.BLACK);
  });

  // `:scope` selects the scope root — for `makeResetStyles` that's the
  // element carrying the reset class.
  test(':scope styles the reset root element', () => {
    const className = applyResetStyles({
      color: 'black',
      '@scope to (.never)': {
        color: 'blue',
      },
    });
    render(`<div class="${className}" data-testid="el">scoped reset root</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.BLUE);
  });
});

describe('makeResetStyles wins over makeStyles via @scope proximity', () => {
  // Per CSS Cascade L6, scope proximity tie-breaks above source order at
  // equal specificity. So a scoped reset rule beats a non-scoped makeStyles
  // rule on the same pseudo, breaking the usual "makeStyles always wins"
  // intuition. When both sides carry @scope, proximity ties and source
  // order takes back over (next describe).
  test('scoped reset :hover wins over non-scoped make :hover', async () => {
    const reset = applyResetStyles({
      background: 'white',
      '@scope to (.never)': {
        ':hover': { background: 'red' },
      },
    });
    const { root: make } = applyStyles({
      root: { ':hover': { background: 'cyan' } },
    });
    render(`<button class="${mergeClasses(reset, make)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.RED);
  });
});

describe('@media inside @scope wins over plain @media via @scope proximity', () => {
  // Two reset classes on the same element:
  //   - reset1: `@scope to (.never) { @media { … } }` — scoped @media
  //   - reset2: `@media { … }` — plain @media
  // Both @media rules apply at equal specificity. Proximity tie-breaks
  // before source order, so the scoped one wins (L6 cascade rule).
  test('scoped reset @media wins over non-scoped reset @media', () => {
    const scoped = applyResetStyles({
      '@scope to (.never)': {
        '@media (min-width: 1px)': { color: 'red' },
      },
    });
    const plain = applyResetStyles({
      '@media (min-width: 1px)': { color: 'cyan' },
    });
    render(`<div class="${mergeClasses(scoped, plain)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.RED);
  });
});

describe('makeStyles wins over makeResetStyles when both wrap in @scope', () => {
  // Both rules are scoped → proximity ties → source order resolves it.
  // Reset's @scope rule lands in bucket `r`/`s`, makeStyles' @scope rule
  // lands later, so makeStyles wins as in the non-scoped baseline.
  test('scoped make color wins over scoped reset color', () => {
    const reset = applyResetStyles({
      '@scope to (.never)': { color: 'red' },
    });
    const { root: make } = applyStyles({
      root: { '@scope to (.never)': { color: 'blue' } },
    });
    render(`<div class="${mergeClasses(reset, make)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.BLUE);
  });

  // Same as above but with @media inside @scope on both sides. Bucket
  // order: reset's @scope+@media → bucket `s`, make's @scope+@media →
  // bucket `m` (after `s`). Specificity ties, proximity ties, source
  // order picks the later bucket → makeStyles wins.
  test('scoped @media make wins over scoped @media reset', () => {
    const reset = applyResetStyles({
      '@scope to (.never)': {
        '@media (min-width: 1px)': { color: 'red' },
      },
    });
    const { root: make } = applyStyles({
      root: {
        '@scope to (.never)': {
          '@media (min-width: 1px)': { color: 'blue' },
        },
      },
    });
    render(`<div class="${mergeClasses(reset, make)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.BLUE);
  });
});
