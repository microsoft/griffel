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
  getColor,
  ORANGE,
  RED,
  render,
  resetBrowserTestState,
  WHITE,
  YELLOW,
} from '../testing/browserHelpers.js';

beforeEach(resetBrowserTestState);

describe('makeResetStyles — LVHA in a single reset class', () => {
  test('sanity: hover, focus, and active each flip and clear as expected', async () => {
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

  test(':hover beats :focus — authored focus-first', async () => {
    const className = applyResetStyles({
      ':focus': { background: 'yellow' },
      ':hover': { background: 'cyan' },
    });
    render(`<button class="${className}" data-testid="btn">reset focus-first</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);

    expect(getBg(btn)).toBe(CYAN);
  });

  // Reset emits declarations in author order into one fat class; unlike
  // makeStyles, there is no per-pseudo bucket re-sort. Authors of reset
  // styles are expected to write pseudos in LVHA order — the tests below
  // pin the documented behavior of out-of-order authoring.
  test(':focus authored after :hover wins in reset (author-order cascade)', async () => {
    const className = applyResetStyles({
      ':hover': { background: 'cyan' },
      ':focus': { background: 'yellow' },
    });
    render(`<button class="${className}" data-testid="btn">reset hover-first</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);

    // Reset emits rules in author order; `:focus` is later so it wins at
    // tied specificity.
    expect(getBg(btn)).toBe(YELLOW);
  });

  test(':active beats :hover — authored hover-first', async () => {
    const className = applyResetStyles({
      ':hover': { background: 'cyan' },
      ':active': { background: 'orange' },
    });
    render(`<button class="${className}" data-testid="btn">reset hover-first-active</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getBg(btn)).toBe(ORANGE);

    await commands.mouseUp();
  });

  test(':hover authored after :active wins in reset (author-order cascade)', async () => {
    const className = applyResetStyles({
      ':active': { background: 'orange' },
      ':hover': { background: 'cyan' },
    });
    render(`<button class="${className}" data-testid="btn">reset active-first</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    // Reset emits rules in author order; `:hover` is later so it wins at
    // tied specificity.
    expect(getBg(btn)).toBe(CYAN);

    await commands.mouseUp();
  });

  test(':active beats both :focus and :hover while held', async () => {
    const className = applyResetStyles({
      ':focus': { background: 'yellow' },
      ':hover': { background: 'cyan' },
      ':active': { background: 'orange' },
    });
    render(`<button class="${className}" data-testid="btn">reset f-h-a</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getBg(btn)).toBe(ORANGE);

    await commands.mouseUp();
  });
});

describe('makeResetStyles vs makeStyles cascade — same pseudo', () => {
  // Core invariant: makeStyles overrides makeResetStyles on the same pseudo.
  // Guaranteed by bucket ordering — the `r` bucket precedes every makeStyles
  // pseudo bucket, so the atomic rule wins via source order at tied specificity.
  test('makeStyles background wins over makeResetStyles background', () => {
    const resetClass = applyResetStyles({ background: 'red' });
    const { root: makeClass } = applyStyles({ root: { background: 'cyan' } });
    render(`<div class="${mergeClasses(resetClass, makeClass)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getBg(el)).toBe(CYAN);
  });

  test('makeStyles :focus wins over makeResetStyles :focus', () => {
    const resetClass = applyResetStyles({
      background: 'white',
      ':focus': { background: 'red' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':focus': { background: 'yellow' },
      },
    });
    render(`<button class="${mergeClasses(resetClass, makeClass)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();

    expect(getBg(btn)).toBe(YELLOW);
  });

  test('makeStyles :hover wins over makeResetStyles :hover', async () => {
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

    await userEvent.hover(btn);

    expect(getBg(btn)).toBe(CYAN);
  });

  test('makeStyles :active wins over makeResetStyles :active while held', async () => {
    const resetClass = applyResetStyles({
      background: 'white',
      ':active': { background: 'red' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':active': { background: 'orange' },
      },
    });
    render(`<button class="${mergeClasses(resetClass, makeClass)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getBg(btn)).toBe(ORANGE);

    await commands.mouseUp();
  });
});

describe('makeResetStyles vs makeStyles cascade — mixed pseudos', () => {
  // Cross-pipeline cascade is driven by bucket ordering (reset first, make
  // second). That means any makeStyles rule overrides any makeResetStyles
  // rule on the same element regardless of which pseudo is on which side.
  // These tests pin that behavior across mixed-pseudo pairings.
  test('make :hover wins over reset :focus on focus+hover', async () => {
    const resetClass = applyResetStyles({
      background: 'white',
      ':focus': { background: 'red' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':hover': { background: 'cyan' },
      },
    });
    render(`<button class="${mergeClasses(resetClass, makeClass)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);

    expect(getBg(btn)).toBe(CYAN);
  });

  test('make :active wins over reset :hover on hover+active', async () => {
    const resetClass = applyResetStyles({
      background: 'white',
      ':hover': { background: 'red' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':active': { background: 'orange' },
      },
    });
    render(`<button class="${mergeClasses(resetClass, makeClass)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getBg(btn)).toBe(ORANGE);

    await commands.mouseUp();
  });

  test('make :focus wins over reset :hover on focus+hover', async () => {
    const resetClass = applyResetStyles({
      background: 'white',
      ':hover': { background: 'cyan' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':focus': { background: 'yellow' },
      },
    });
    render(`<button class="${mergeClasses(resetClass, makeClass)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    btn.focus();
    await userEvent.hover(btn);

    expect(getBg(btn)).toBe(YELLOW);
  });

  test('make :hover wins over reset :active on hover+active', async () => {
    const resetClass = applyResetStyles({
      background: 'white',
      ':active': { background: 'orange' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':hover': { background: 'cyan' },
      },
    });
    render(`<button class="${mergeClasses(resetClass, makeClass)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);
    await commands.mouseDown();

    expect(getBg(btn)).toBe(CYAN);

    await commands.mouseUp();
  });
});

describe('makeResetStyles vs makeStyles cascade — :link', () => {
  test('make :link wins over reset :hover on hovered <a href>', async () => {
    const resetClass = applyResetStyles({
      ':hover': { color: 'cyan' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':link': { color: 'red' },
      },
    });
    render(
      `<a href="https://example.com/never-visited" class="${mergeClasses(
        resetClass,
        makeClass,
      )}" data-testid="link">x</a>`,
    );
    const link = document.querySelector<HTMLAnchorElement>('[data-testid=link]')!;

    await userEvent.hover(link);

    expect(getColor(link)).toBe(RED);
  });

  test('make :hover wins over reset :link on hovered <a href>', async () => {
    const resetClass = applyResetStyles({
      ':link': { color: 'red' },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':hover': { color: 'cyan' },
      },
    });
    render(
      `<a href="https://example.com/never-visited" class="${mergeClasses(
        resetClass,
        makeClass,
      )}" data-testid="link">x</a>`,
    );
    const link = document.querySelector<HTMLAnchorElement>('[data-testid=link]')!;

    await userEvent.hover(link);

    expect(getColor(link)).toBe(CYAN);
  });
});
