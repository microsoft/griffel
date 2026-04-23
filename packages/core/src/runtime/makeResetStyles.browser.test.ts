// Exercises Griffel's makeResetStyles pipeline in a real browser.

import { beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { mergeClasses } from '../index.js';
import {
  applyResetStyles,
  applyStyles,
  commands,
  CYAN,
  getBg,
  ORANGE,
  render,
  resetBrowserTestState,
  WHITE,
  YELLOW,
} from '../testing/browserHelpers.js';

beforeEach(resetBrowserTestState);

describe('makeResetStyles — LVHA in a single reset class', () => {
  // Reset styles collapse to one fat class rather than per-declaration atoms.
  // This verifies the cascade still honours LVHA inside that single class.
  test('hover, focus, and active each flip and clear as expected', async () => {
    const className = applyResetStyles({
      background: 'white',
      ':focus': { background: 'yellow' },
      ':hover': { background: 'cyan' },
      ':active': { background: 'orange' },
    });
    render(`<button class="${className}" data-testid="btn">reset sanity</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    expect(getBg(btn)).toBe(WHITE);

    btn.focus();
    expect(getBg(btn)).toBe(YELLOW);

    await userEvent.hover(btn);
    expect(getBg(btn)).toBe(CYAN);

    await commands.mouseDown();
    expect(getBg(btn)).toBe(ORANGE);

    await commands.mouseUp();
    expect(getBg(btn)).toBe(CYAN);

    await userEvent.unhover(btn);
    expect(getBg(btn)).toBe(YELLOW);

    btn.blur();
    expect(getBg(btn)).toBe(WHITE);
  });
});

describe('makeResetStyles vs makeStyles cascade', () => {
  // The intended invariant: when both makeResetStyles and makeStyles
  // define the same property on the same element, makeStyles wins.
  // Reset styles land in the `r` bucket which is inserted before any
  // per-pseudo bucket, so makeStyles' atoms come later in the DOM and
  // win on source order.
  test('makeStyles background wins over makeResetStyles background', () => {
    const resetClass = applyResetStyles({ background: 'red' });
    const { root: makeClass } = applyStyles({ root: { background: 'cyan' } });
    render(`<div class="${mergeClasses(resetClass, makeClass)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getBg(el)).toBe(CYAN);
  });

  test('makeStyles :hover still wins over makeResetStyles :hover', async () => {
    const resetClass = applyResetStyles({
      background: 'white',
      ':hover': { background: 'red' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':hover': { background: 'cyan' },
      },
    });
    render(`<button class="${mergeClasses(resetClass, makeClass)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    expect(getBg(btn)).toBe(WHITE);

    await userEvent.hover(btn);
    expect(getBg(btn)).toBe(CYAN);
  });
});
