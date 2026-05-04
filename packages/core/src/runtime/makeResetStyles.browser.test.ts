// Pins the cross-pipeline cascade between makeStyles and makeResetStyles
// in a real browser. No `@scope` content here — these tests describe the
// existing baseline behavior so subsequent `@scope` work has a reference.
//
// Quick model:
//   - makeStyles emits one atomic class per declaration (per-pseudo bucket
//     `d`/`l`/`v`/`f`/`h`/`a`).
//   - makeResetStyles emits one fat class with everything inside (bucket
//     `r`); nested at-rules are hoisted into bucket `s`.
//   - Bucket order in the DOM is `r → d → l → v → w → f → i → h → a → s → k → t → m → c`.
// Source-order rules apply at tied specificity. Specificity follows CSS.

import { beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { mergeClasses } from '../index.js';
import {
  applyResetStyles,
  applyStyles,
  COLORS,
  commands,
  getColor,
  getComputedBackgroundColor,
  render,
  resetBrowserTestState,
} from '../common/browserHelpers.js';

beforeEach(resetBrowserTestState);

describe('makeStyles overrides makeResetStyles at the same selector', () => {
  // Both rules target the element via a single class selector, equal
  // specificity. makeStyles' atomic class lands in bucket `d`, the reset
  // class lands in bucket `r` (which comes first), so makeStyles wins by
  // source order.
  test('makeStyles base color wins over makeResetStyles base color', () => {
    const reset = applyResetStyles({ color: 'red' });
    const { root: make } = applyStyles({ root: { color: 'cyan' } });
    render(`<div class="${mergeClasses(reset, make)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.CYAN);
  });

  test('makeStyles :hover wins over makeResetStyles :hover on hover', async () => {
    const reset = applyResetStyles({ ':hover': { color: 'red' } });
    const { root: make } = applyStyles({ root: { ':hover': { color: 'cyan' } } });
    render(`<button class="${mergeClasses(reset, make)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    expect(getColor(btn)).toBe(COLORS.CYAN);
  });

  test('makeStyles :active wins over makeResetStyles :active while held', async () => {
    const reset = applyResetStyles({ ':active': { background: 'red' } });
    const { root: make } = applyStyles({
      root: { ':active': { background: 'orange' } },
    });
    render(`<button class="${mergeClasses(reset, make)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();
    expect(getComputedBackgroundColor(btn)).toBe(COLORS.ORANGE);
    await commands.mouseUp();
  });
});

describe('makeResetStyles overrides makeStyles when its selector is more specific', () => {
  // A reset `:hover` rule (specificity 0,2,0) outranks a non-pseudo
  // makeStyles rule (specificity 0,1,0) on hover regardless of bucket
  // order, because specificity beats source order in the CSS cascade.
  test('makeResetStyles :hover wins over makeStyles base on hover', async () => {
    const reset = applyResetStyles({ ':hover': { color: 'red' } });
    const { root: make } = applyStyles({ root: { color: 'cyan' } });
    render(`<button class="${mergeClasses(reset, make)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    expect(getColor(btn)).toBe(COLORS.CYAN);
    await userEvent.hover(btn);
    expect(getColor(btn)).toBe(COLORS.RED);
    await userEvent.unhover(btn);
    expect(getColor(btn)).toBe(COLORS.CYAN);
  });
});

describe('makeResetStyles wins via bucket order when at-rule wraps the rule', () => {
  // `@media` inside makeResetStyles is hoisted to bucket `s` (at-rules
  // for reset styles), which comes after every makeStyles pseudo bucket.
  // So the reset rule lands later in the DOM and wins at tied specificity.
  test('makeResetStyles @media base wins over makeStyles base', () => {
    const reset = applyResetStyles({
      '@media': { color: 'red' },
    });
    const { root: make } = applyStyles({ root: { color: 'cyan' } });
    render(`<div class="${mergeClasses(reset, make)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.RED);
  });
});

describe('makeStyles wins via bucket order when both pipelines wrap the rule in the same at-rule', () => {
  // Once makeStyles also wraps the rule in `@media`/`@layer`, the rule
  // routes to a bucket that lives AFTER the reset at-rules bucket
  // (`m`/`t` come after `s`), so the makeStyles rule lands later in the
  // DOM and wins at tied specificity. Direction-flipping counterpart to
  // the previous group.
  test('makeStyles @media wins over makeResetStyles @media at the same selector', () => {
    // makeStyles routes by `atRules.media` truthiness — needs a non-empty
    // predicate to land in bucket `m`. `@media all` is the smallest one
    // that always matches.
    const reset = applyResetStyles({
      '@media all': { color: 'red' },
    });
    const { root: make } = applyStyles({
      root: { '@media all': { color: 'cyan' } },
    });
    render(`<div class="${mergeClasses(reset, make)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.CYAN);
  });

  test('makeStyles @layer wins over makeResetStyles @layer at the same selector and layer', () => {
    const reset = applyResetStyles({
      '@layer base': { color: 'red' },
    });
    const { root: make } = applyStyles({
      root: { '@layer base': { color: 'cyan' } },
    });
    render(`<div class="${mergeClasses(reset, make)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.CYAN);
  });
});

describe('combined: reset with base + :hover + @media vs make with base + :hover', () => {
  // Walks every cascade rule in a single scenario:
  //   - reset: base (`r`) + `:hover` (still `r`) + `@media` base (hoisted to `s`)
  //   - make:  base (`d`) + `:hover` (`h`)
  // Idle: tied specificity (0,1,0) across reset base, make base, and
  //   reset @media. Source order picks the last bucket = `s`
  //   (reset @media). → orange wins.
  // Hover: highest specificity is (0,2,0), tied between reset's :hover
  //   rule (still in `r`) and make's :hover rule (in `h`). Source order:
  //   `h` after `r`, so make's :hover wins. → yellow.
  test('idle picks the @media reset rule; hover picks the makeStyles :hover rule', async () => {
    const reset = applyResetStyles({
      color: 'red',
      ':hover': { color: 'blue' },
      '@media': { color: 'orange' },
    });
    const { root: make } = applyStyles({
      root: {
        color: 'cyan',
        ':hover': { color: 'yellow' },
      },
    });
    render(`<button class="${mergeClasses(reset, make)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    expect(getColor(btn)).toBe(COLORS.ORANGE);

    await userEvent.hover(btn);
    expect(getColor(btn)).toBe(COLORS.YELLOW);
  });
});
