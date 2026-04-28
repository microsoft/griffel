// Exercises Griffel's LVFHA pseudo-class cascade in a real browser.
// See https://griffel.js.org/react/guides/atomic-css/#lvfha-order-of-pseudo-classes

import { beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import {
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

describe('sanity: state transitions actually fire in the browser', () => {
  // Walks every state transition on one element so we know userEvent/commands
  // are flipping real pseudo-class state, not just the test passing by accident.
  test('hover, focus, and active each flip and clear as expected', async () => {
    const { root } = applyStyles({
      root: {
        background: 'white',
        ':focus': { background: 'yellow' },
        ':hover': { background: 'cyan' },
        ':active': { background: 'orange' },
      },
    });
    render(`<button class="${root}" data-testid="btn">sanity</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    // idle
    expect(getBg(btn)).toBe(WHITE);

    // focus only
    btn.focus();
    expect(getBg(btn)).toBe(YELLOW);

    // focus + hover — hover wins over focus
    await userEvent.hover(btn);
    expect(getBg(btn)).toBe(CYAN);

    // focus + hover + active — active wins over all
    await commands.mouseDown();
    expect(getBg(btn)).toBe(ORANGE);

    // release: back to focus + hover — hover wins again
    await commands.mouseUp();
    expect(getBg(btn)).toBe(CYAN);

    // unhover: focus alone
    await userEvent.unhover(btn);
    expect(getBg(btn)).toBe(YELLOW);

    // blur: back to idle
    btn.blur();
    expect(getBg(btn)).toBe(WHITE);
  });
});

describe('LVHA cascade', () => {
  test(':hover wins over :focus when both match', async () => {
    const { root } = applyStyles({
      root: {
        ':focus': { background: 'yellow' },
        ':hover': { background: 'cyan' },
      },
    });
    render(`<button class="${root}" data-testid="btn">hover-vs-focus</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);

    expect(getBg(btn)).toBe(CYAN);
  });

  test(':hover still wins when authored before :focus', async () => {
    // Verifies Griffel's bucket ordering is not author-order dependent.
    const { root } = applyStyles({
      root: {
        ':hover': { background: 'cyan' },
        ':focus': { background: 'yellow' },
      },
    });
    render(`<button class="${root}" data-testid="btn">hover-authored-first</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);

    expect(getBg(btn)).toBe(CYAN);
  });

  test(':active wins over :hover while mouse held', async () => {
    const { root } = applyStyles({
      root: {
        ':hover': { background: 'lightgreen' },
        ':active': { background: 'orange' },
      },
    });
    render(`<button class="${root}" data-testid="btn">active-vs-hover</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getBg(btn)).toBe(ORANGE);

    await commands.mouseUp();
  });

  test(':active still wins when authored before :hover', async () => {
    const { root } = applyStyles({
      root: {
        ':active': { background: 'orange' },
        ':hover': { background: 'lightgreen' },
      },
    });
    render(`<button class="${root}" data-testid="btn">active-authored-first</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getBg(btn)).toBe(ORANGE);

    await commands.mouseUp();
  });

  test(':active wins over both :focus and :hover while held', async () => {
    const { root } = applyStyles({
      root: {
        ':focus': { background: 'yellow' },
        ':hover': { background: 'lightgreen' },
        ':active': { background: 'orange' },
      },
    });
    render(`<button class="${root}" data-testid="btn">focus-hover-active</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getBg(btn)).toBe(ORANGE);

    await commands.mouseUp();
  });
});
