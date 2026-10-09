import { beforeEach, describe, expect, test } from 'vitest';

import { createDOMRenderer, makeStyles } from '../index.js';
import { applyStyles, render, resetBrowserTestState } from '../common/browserHelpers.js';

beforeEach(resetBrowserTestState);

// Inserts two independent atomic classes through a shared renderer, in the given order, to
// reproduce cross-component composition (e.g. a user `padding` next to Fluent's `padding-block`).
function composeSeparateClasses(a: Parameters<typeof makeStyles>[0]['root'], b: typeof a): string {
  const renderer = createDOMRenderer(document);
  const clsA = makeStyles({ root: a })({ dir: 'ltr', renderer }).root;
  const clsB = makeStyles({ root: b })({ dir: 'ltr', renderer }).root;

  return `${clsA} ${clsB}`;
}

describe('logical properties', () => {
  test.each([
    {
      paddingRight: '2px',
      paddingInline: '3px',
    },
    {
      paddingInline: '3px',
      paddingRight: '2px',
    },
  ])('logical padding wins over physical padding', styles => {
    const { root } = applyStyles({ root: styles });
    render(`<div class="${root}" data-testid="target"></div>`);

    const target = document.querySelector('[data-testid=target]')!;
    const computedStyle = getComputedStyle(target);

    expect(computedStyle.paddingLeft).toBe('3px');
    expect(computedStyle.paddingRight).toBe('3px');
  });

  test.each([
    {
      marginRight: '2px',
      marginInline: '3px',
    },
    {
      marginInline: '3px',
      marginRight: '2px',
    },
  ])('logical margin wins over physical margin', styles => {
    const { root } = applyStyles({ root: styles });
    render(`<div class="${root}" data-testid="target"></div>`);

    const target = document.querySelector('[data-testid=target]')!;
    const computedStyle = getComputedStyle(target);

    expect(computedStyle.marginLeft).toBe('3px');
    expect(computedStyle.marginRight).toBe('3px');
  });

  // Runtime/extraction parity: two independent classes must resolve deterministically regardless of
  // the order they are inserted, matching the priority-sorted order used by extraction.
  test.each([
    ['padding first', true],
    ['padding-block first', false],
  ] as const)('padding-block wins over padding shorthand (%s)', (_label, paddingFirst) => {
    const className = paddingFirst
      ? composeSeparateClasses({ padding: '6px 10px' }, { paddingBlock: '5px' })
      : composeSeparateClasses({ paddingBlock: '5px' }, { padding: '6px 10px' });
    render(`<div class="${className}" data-testid="target"></div>`);

    const computedStyle = getComputedStyle(document.querySelector('[data-testid=target]')!);

    expect(computedStyle.paddingTop).toBe('5px');
    expect(computedStyle.paddingBottom).toBe('5px');
    expect(computedStyle.paddingLeft).toBe('10px');
    expect(computedStyle.paddingRight).toBe('10px');
  });

  test.each([
    ['physical first', true],
    ['logical first', false],
  ] as const)('padding-inline-end wins over padding-right (%s)', (_label, physicalFirst) => {
    const className = physicalFirst
      ? composeSeparateClasses({ paddingRight: '2px' }, { paddingInlineEnd: '4px' })
      : composeSeparateClasses({ paddingInlineEnd: '4px' }, { paddingRight: '2px' });
    render(`<div class="${className}" data-testid="target"></div>`);

    const computedStyle = getComputedStyle(document.querySelector('[data-testid=target]')!);

    expect(computedStyle.paddingRight).toBe('4px');
  });

  test.each([
    ['shorthand first', true],
    ['longhand first', false],
  ] as const)('padding-block-end wins over padding-block shorthand (%s)', (_label, shorthandFirst) => {
    const className = shorthandFirst
      ? composeSeparateClasses({ paddingBlock: '5px' }, { paddingBlockEnd: '10px' })
      : composeSeparateClasses({ paddingBlockEnd: '10px' }, { paddingBlock: '5px' });
    render(`<div class="${className}" data-testid="target"></div>`);

    const computedStyle = getComputedStyle(document.querySelector('[data-testid=target]')!);

    expect(computedStyle.paddingTop).toBe('5px');
    expect(computedStyle.paddingBottom).toBe('10px');
  });

  test.each([
    ['inset first', true],
    ['inset-block first', false],
  ] as const)('inset-block wins over inset shorthand (%s)', (_label, insetFirst) => {
    const className = insetFirst
      ? composeSeparateClasses({ inset: '2px' }, { insetBlock: '4px' })
      : composeSeparateClasses({ insetBlock: '4px' }, { inset: '2px' });
    render(`<div class="${className}" style="position: relative" data-testid="target"></div>`);

    const computedStyle = getComputedStyle(document.querySelector('[data-testid=target]')!);

    expect(computedStyle.top).toBe('4px');
    expect(computedStyle.bottom).toBe('4px');
    expect(computedStyle.left).toBe('2px');
    expect(computedStyle.right).toBe('2px');
  });

  test.each([
    ['width first', true],
    ['inline-size first', false],
  ] as const)('inline-size wins over width (%s)', (_label, widthFirst) => {
    const className = widthFirst
      ? composeSeparateClasses({ width: '100px' }, { inlineSize: '200px' })
      : composeSeparateClasses({ inlineSize: '200px' }, { width: '100px' });
    render(`<div class="${className}" data-testid="target"></div>`);

    const computedStyle = getComputedStyle(document.querySelector('[data-testid=target]')!);

    expect(computedStyle.width).toBe('200px');
  });

  test.each([
    ['physical first', true],
    ['logical first', false],
  ] as const)('logical border color wins over physical border color (%s)', (_label, physicalFirst) => {
    const className = physicalFirst
      ? composeSeparateClasses({ borderLeftColor: 'red' }, { borderInlineStartColor: 'blue' })
      : composeSeparateClasses({ borderInlineStartColor: 'blue' }, { borderLeftColor: 'red' });
    render(`<div class="${className}" data-testid="target"></div>`);

    const computedStyle = getComputedStyle(document.querySelector('[data-testid=target]')!);

    expect(computedStyle.borderLeftColor).toBe('rgb(0, 0, 255)');
  });

  test.each([
    ['physical first', true],
    ['logical first', false],
  ] as const)('logical corner radius wins over physical corner radius (%s)', (_label, physicalFirst) => {
    const className = physicalFirst
      ? composeSeparateClasses({ borderTopLeftRadius: '2px' }, { borderStartStartRadius: '8px' })
      : composeSeparateClasses({ borderStartStartRadius: '8px' }, { borderTopLeftRadius: '2px' });
    render(`<div class="${className}" data-testid="target"></div>`);

    const computedStyle = getComputedStyle(document.querySelector('[data-testid=target]')!);

    expect(computedStyle.borderTopLeftRadius).toBe('8px');
  });

  test.each([
    ['physical first', true],
    ['logical first', false],
  ] as const)('logical border-block-color wins over physical border color (%s)', (_label, physicalFirst) => {
    const className = physicalFirst
      ? composeSeparateClasses({ borderTopColor: 'blue' }, { borderBlockColor: 'red' })
      : composeSeparateClasses({ borderBlockColor: 'red' }, { borderTopColor: 'blue' });
    render(`<div class="${className}" data-testid="target"></div>`);

    const computedStyle = getComputedStyle(document.querySelector('[data-testid=target]')!);

    expect(computedStyle.borderTopColor).toBe('rgb(255, 0, 0)');
  });
});
