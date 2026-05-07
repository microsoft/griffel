import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './common/snapshotMatchers.js';
import { createDOMRenderer } from './renderer/createDOMRenderer.js';
import { makeResetStyles } from './makeResetStyles.js';
import type { GriffelRenderer } from './types.js';

describe('makeResetStyles', () => {
  let renderer: GriffelRenderer;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    renderer = createDOMRenderer(document);
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('returns a single classname for a single style', async () => {
    const computeClassName = makeResetStyles({
      color: 'red',
      flexDirection: 'row',
    });

    expect(computeClassName({ dir: 'ltr', renderer })).toEqual('r7lmmpp');
    await expect(renderer).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" {"data-priority":"0"} **/
      .r7lmmpp {
        color: red;
        flex-direction: row;
      }"
    `);
  });

  it('handles RTL', async () => {
    const computeClassName = makeResetStyles({
      padding: '40px 20px 10px 5px',
    });

    expect(computeClassName({ dir: 'ltr', renderer })).toEqual('rgb6zd6');
    expect(computeClassName({ dir: 'rtl', renderer })).toEqual('rjhindo');

    await expect(renderer).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" {"data-priority":"0"} **/
      .rgb6zd6 {
        padding: 40px 20px 10px 5px;
      }
      .rjhindo {
        padding: 40px 5px 10px 20px;
      }"
    `);
  });

  it('handles at rules', async () => {
    const computeClassName = makeResetStyles({
      color: 'red',
      '@media (min-width: 100px)': { color: 'blue' },
    });

    expect(computeClassName({ dir: 'ltr', renderer })).toEqual('rbwcbv2');
    await expect(renderer).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" {"data-priority":"0"} **/
      .rbwcbv2 {
        color: red;
      }
      /** bucket "s" {"data-priority":"0"} **/
      @media (min-width: 100px) {
        .rbwcbv2 {
          color: blue;
        }
      }"
    `);
  });

  describe('classNameHashSalt', () => {
    it('applies a salt to the hash', () => {
      const rendererWithSalt = createDOMRenderer(document, { classNameHashSalt: 'salt' });

      const resultWithSalt = makeResetStyles({ color: 'red' })({ dir: 'ltr', renderer });
      const resultWithoutSalt = makeResetStyles({ color: 'red' })({ dir: 'ltr', renderer: rendererWithSalt });

      expect(resultWithSalt).toMatchInlineSnapshot(`"rtokvmb"`);
      expect(resultWithoutSalt).toMatchInlineSnapshot(`"r1fkucf3"`);

      expect(resultWithSalt).not.toBe(resultWithoutSalt);
    });
  });
});
