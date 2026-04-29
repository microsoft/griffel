// Exercises Griffel's LVFHA pseudo-class cascade in a real browser.
// See https://griffel.js.org/react/guides/atomic-css/#lvfha-order-of-pseudo-classes

import { beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import {
  applyStyles,
  COLORS,
  commands,
  getComputedBackgroundColor,
  render,
  resetBrowserTestState,
} from '../common/browserHelpers.js';

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
    expect(getComputedBackgroundColor(btn)).toBe(COLORS.WHITE);

    // focus only
    btn.focus();
    expect(getComputedBackgroundColor(btn)).toBe(COLORS.YELLOW);

    // focus + hover — hover wins over focus
    await userEvent.hover(btn);
    expect(getComputedBackgroundColor(btn)).toBe(COLORS.CYAN);

    // focus + hover + active — active wins over all
    await commands.mouseDown();
    expect(getComputedBackgroundColor(btn)).toBe(COLORS.ORANGE);

    // release: back to focus + hover — hover wins again
    await commands.mouseUp();
    expect(getComputedBackgroundColor(btn)).toBe(COLORS.CYAN);

    // unhover: focus alone
    await userEvent.unhover(btn);
    expect(getComputedBackgroundColor(btn)).toBe(COLORS.YELLOW);

    // blur: back to idle
    btn.blur();
    expect(getComputedBackgroundColor(btn)).toBe(COLORS.WHITE);
  });
});

describe('LVFHA runtime cascade', () => {
  test(':link applies to an unvisited anchor with href', () => {
    const { root } = applyStyles({
      root: {
        ':link': { background: 'cyan' },
      },
    });
    render(`<a href="#" class="${root}" data-testid="link">link</a>`);
    const link = document.querySelector<HTMLAnchorElement>('[data-testid=link]')!;

    expect(getComputedBackgroundColor(link)).toBe(COLORS.CYAN);
  });

  test(':focus wins over :link even when :focus is authored first', () => {
    // The Griffel-specific guarantee: :link is bucketed before :focus
    // regardless of authoring order, so :focus (later bucket) wins on a
    // focused unvisited anchor.
    const { root } = applyStyles({
      root: {
        ':focus': { background: 'yellow' },
        ':link': { background: 'cyan' },
      },
    });
    render(`<a href="#" class="${root}" data-testid="link">link</a>`);
    const link = document.querySelector<HTMLAnchorElement>('[data-testid=link]')!;

    expect(getComputedBackgroundColor(link)).toBe(COLORS.CYAN);

    link.focus();
    expect(getComputedBackgroundColor(link)).toBe(COLORS.YELLOW);
  });

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

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.CYAN);
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

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.CYAN);
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

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.ORANGE);

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

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.ORANGE);

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

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.ORANGE);

    await commands.mouseUp();
  });
});
