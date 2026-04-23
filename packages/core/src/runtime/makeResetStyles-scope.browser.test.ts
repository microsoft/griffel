// @scope inside makeResetStyles. Current resolveResetStyleRules does NOT
// handle `@scope to (...)` — it falls through to warnAboutUnresolvedRule
// and silently drops the rule. PR5 plans to add parity with makeStyles.
// These tests are expected to RED until that lands, and then to GREEN
// without modification.
//
// Also pay attention to ltrCSSAtRules (resolveResetStyleRules.ts:146) and
// isAtRuleElement (stylis/isAtRuleElement.ts) — @scope must either be
// lifted into the atRules array or handled by a dedicated reset path.

import { beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { mergeClasses } from '../index.js';
import {
  applyResetStyles,
  applyStyles,
  BLACK,
  BLUE,
  CYAN,
  getBg,
  getColor,
  RED,
  render,
  resetBrowserTestState,
} from '../testing/browserHelpers.js';

beforeEach(resetBrowserTestState);

describe('@scope inside makeResetStyles', () => {
  // `.fails` flips when PR5 teaches resolveResetStyleRules.createStringFromStyles
  // to route `@scope to (...)` the way makeStyles does. When this starts
  // passing, drop `.fails` and drop the sibling annotation below.
  test.fails('scoped descendant rule applies inside the scope; non-scoped sibling stays default', () => {
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

    expect(getColor(document.querySelector('[data-testid=scoped]')!)).toBe(RED);
    expect(getColor(document.querySelector('[data-testid=outside]')!)).toBe(BLACK);
  });

  test.fails('scoped :scope color applies on the reset root element', () => {
    const className = applyResetStyles({
      color: 'black',
      '@scope to (.never)': {
        color: 'blue',
      },
    });
    render(`<div class="${className}" data-testid="el">scoped reset root</div>`);
    const el = document.querySelector('[data-testid=el]')!;

    expect(getColor(el)).toBe(BLUE);
  });
});

describe('makeStyles wins over makeResetStyles — @scope on either side', () => {
  test('plain makeStyles :hover beats scoped makeResetStyles :hover', async () => {
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

    expect(getBg(btn)).toBe(CYAN);
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

    expect(getColor(el)).toBe(BLUE);
  });
});
