// Verifies Griffel's emitted `@scope` boundary behavior in a real browser.

import { beforeEach, describe, expect, test } from 'vitest';
import { applyStyles, COLORS, getColor, render, resetBrowserTestState } from '../common/browserHelpers.js';

beforeEach(resetBrowserTestState);

describe('@scope boundary isolation', () => {
  test('descendant inside scope gets scoped styles; past boundary does not', () => {
    const { root } = applyStyles({
      root: {
        '@scope to (.boundary)': {
          '& p': { color: 'red' },
        },
      },
    });
    render(`
      <div class="${root}">
        <p data-testid="scoped">Inside scope</p>
        <div class="boundary">
          <p data-testid="outside">Past boundary</p>
        </div>
      </div>
    `);

    const scoped = document.querySelector('[data-testid=scoped]')!;
    const outside = document.querySelector('[data-testid=outside]')!;

    expect(getColor(scoped)).toBe(COLORS.RED);
    expect(getColor(outside)).toBe(COLORS.BLACK);
  });

  test('nested scope root re-establishes scope past the boundary', () => {
    const { root } = applyStyles({
      root: {
        '@scope to (.inner-boundary)': {
          '& p': { color: 'blue' },
        },
      },
    });
    render(`
      <div class="${root}">
        <p data-testid="inside">Inside scope</p>
        <div class="inner-boundary">
          <p data-testid="past">Past boundary</p>
          <div class="${root}">
            <p data-testid="restart">Nested scope restart</p>
          </div>
        </div>
      </div>
    `);

    const inside = document.querySelector('[data-testid=inside]')!;
    const past = document.querySelector('[data-testid=past]')!;
    const restart = document.querySelector('[data-testid=restart]')!;

    expect(getColor(inside)).toBe(COLORS.BLUE);
    expect(getColor(past)).toBe(COLORS.BLACK);
    expect(getColor(restart)).toBe(COLORS.BLUE);
  });
});
