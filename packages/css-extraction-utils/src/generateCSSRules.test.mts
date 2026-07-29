import type { CSSRulesByBucket } from '@griffel/core';
import { describe, it, expect } from 'vitest';

import { generateCSSRules } from './generateCSSRules.mjs';

describe('generateCSSRules', () => {
  it('generates CSS rules', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: ['.baz { color: orange; }', '.foo { color: red; }'],
    };

    expect(generateCSSRules(cssRulesByBucket)).toMatchInlineSnapshot(`
      "/** @griffel:css-start [d] null **/
      .baz { color: orange; }
      .foo { color: red; }
      /** @griffel:css-end **/"
    `);
  });

  it('handles empty CSS rules', () => {
    const cssRulesByBucket: CSSRulesByBucket = {};

    expect(generateCSSRules(cssRulesByBucket)).toMatchInlineSnapshot(`""`);
  });

  it('handle CSS rules with mixed metadata', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: [
        '.foo { color: orange; }',
        ['.bar { color: red; }', { p: -2 }],
        ['.baz { color: green; }', { p: -2 }],
        ['.qux { color: blue; }', { p: -3 }],
      ],
      f: ['.foo:focus { color: orange; }', ['.bar:focus { color: red; }', { p: -2 }]],
    };

    expect(generateCSSRules(cssRulesByBucket)).toMatchInlineSnapshot(`
      "/** @griffel:css-start [d] null **/
      .foo { color: orange; }
      /** @griffel:css-end **/
      /** @griffel:css-start [d] {"p":-2} **/
      .bar { color: red; }
      .baz { color: green; }
      /** @griffel:css-end **/
      /** @griffel:css-start [d] {"p":-3} **/
      .qux { color: blue; }
      /** @griffel:css-end **/
      /** @griffel:css-start [f] null **/
      .foo:focus { color: orange; }
      /** @griffel:css-end **/
      /** @griffel:css-start [f] {"p":-2} **/
      .bar:focus { color: red; }
      /** @griffel:css-end **/"
    `);
  });
});
