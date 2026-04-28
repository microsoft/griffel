// @scope inside makeResetStyles. resolveResetStyleRules routes `@scope to (...)`
// to the `s` bucket via stylis's at-rule hoisting — see isAtRuleElement.ts.

import { beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { mergeClasses } from '../index.js';
import {
  applyResetStyles,
  applyStyles,
  COLORS,
  getComputedBackgroundColor,
  getColor,
  render,
  resetBrowserTestState,
} from '../common/browserHelpers.js';

beforeEach(resetBrowserTestState);

describe('@scope inside makeResetStyles', () => {
  test('scoped descendant rule applies inside the scope; non-scoped sibling stays default', () => {
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

    // eslint-disable-next-line no-console
    console.log(
      'stylesheets:',
      Array.from(document.querySelectorAll<HTMLStyleElement>('style')).map(s => ({
        bucket: s.getAttribute('data-make-styles-bucket'),
        rules: s.sheet ? Array.from(s.sheet.cssRules).map(r => r.cssText) : null,
      })),
    );

    expect(getColor(document.querySelector('[data-testid=scoped]')!)).toBe(COLORS.RED);
    expect(getColor(document.querySelector('[data-testid=outside]')!)).toBe(COLORS.BLACK);
  });

  test('scoped :scope color applies on the reset root element', () => {
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

describe('makeStyles vs makeResetStyles — @scope interactions', () => {
  // CSS @scope proximity is a tie-breaker between scoped and non-scoped
  // rules at equal specificity (see CSS Cascade Level 6). That means
  // scoped makeResetStyles DOES win over plain makeStyles at the same
  // pseudo — the "makeStyles always wins" invariant cannot hold once
  // @scope is in the mix. When both sides carry @scope (next test),
  // proximity ties and source order takes over so makeStyles wins again.
  test('scoped makeResetStyles :hover wins over plain makeStyles :hover via @scope proximity', async () => {
    const resetClass = applyResetStyles({
      background: 'white',
      '@scope to (.never)': {
        ':hover': { background: 'red' },
      },
    });
    const { root: makeClass } = applyStyles({
      root: {
        ':hover': { background: 'cyan' },
      },
    });
    render(`<button class="${mergeClasses(resetClass, makeClass)}" data-testid="btn">x</button>`);
    const btn = document.querySelector<HTMLButtonElement>('[data-testid=btn]')!;

    await userEvent.hover(btn);

    expect(getComputedBackgroundColor(btn)).toBe(COLORS.RED);
  });

  test('scoped makeStyles color beats scoped makeResetStyles color', () => {
    const resetClass = applyResetStyles({
      '@scope to (.never)': {
        color: 'red',
      },
    });
    const { root: makeClass } = applyStyles({
      root: {
        '@scope to (.never)': {
          color: 'blue',
        },
      },
    });
    render(`<div class="${mergeClasses(resetClass, makeClass)}" data-testid="el">x</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(COLORS.BLUE);
  });
});
