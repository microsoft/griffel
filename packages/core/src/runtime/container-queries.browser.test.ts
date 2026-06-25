// Pins the real-browser cascade outcome of "@container" query sorting. Griffel
// splits each "@container" condition into its own bucket-`c` style sheet and
// orders them with the renderer's `compareContainerQueries`. Because the sheets
// share specificity, DOM order decides the winner at a given container size:
// the later sheet wins. So a mobile-first comparator (ascending min-width) must
// emit the larger breakpoint last for it to win at larger container sizes.
//
// We assert the COMPUTED color against a real query container — inspecting DOM
// order would not prove the cascade actually resolves the way we expect.

import { beforeEach, describe, expect, test } from 'vitest';
import { createDOMRenderer, makeStyles } from '../index.js';
import { COLORS, getColor, render, resetBrowserTestState } from '../common/browserHelpers.js';

beforeEach(resetBrowserTestState);

// Numeric ordering by min-width — the same behavior `compareCSSQueries` from
// `@griffel/utils` provides, inlined to keep `@griffel/core` dependency-free.
function compareContainerQueriesByMinWidth(a: string, b: string): number {
  const width = (condition: string) => Number(/min-width:\s*([\d.]+)/.exec(condition)?.[1] ?? 0);
  return width(a) - width(b);
}

describe('@container query sorting cascade', () => {
  test('the highest matching breakpoint wins at larger container sizes', () => {
    // Authored largest-first. "480" < "1024" numerically but NOT
    // lexicographically ("1024" < "480" as strings), so only a numeric
    // comparator emits them in ascending order and lets 1024px win at >= 1024px.
    const getStyles = makeStyles({
      box: {
        color: 'cyan',
        '@container (min-width: 1024px)': { color: 'blue' },
        '@container (min-width: 480px)': { color: 'red' },
      },
    });
    const renderer = createDOMRenderer(document, {
      compareContainerQueries: compareContainerQueriesByMinWidth,
    });
    const { box } = getStyles({ dir: 'ltr', renderer });

    render(`
      <div style="container-type: inline-size; width: 1200px">
        <div class="${box}" data-testid="lg">x</div>
      </div>
      <div style="container-type: inline-size; width: 800px">
        <div class="${box}" data-testid="md">x</div>
      </div>
      <div style="container-type: inline-size; width: 300px">
        <div class="${box}" data-testid="sm">x</div>
      </div>
    `);

    // 1200px: both breakpoints match; 1024px is emitted last → wins.
    expect(getColor(document.querySelector('[data-testid=lg]')!)).toBe(COLORS.BLUE);
    // 800px: only the 480px breakpoint matches.
    expect(getColor(document.querySelector('[data-testid=md]')!)).toBe(COLORS.RED);
    // 300px: no breakpoint matches → base color.
    expect(getColor(document.querySelector('[data-testid=sm]')!)).toBe(COLORS.CYAN);
  });
});
