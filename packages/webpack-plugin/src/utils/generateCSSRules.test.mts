import { describe, it, expect } from 'vitest';
import type { CSSRulesByBucket } from '@griffel/core';
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

  const sample: CSSRulesByBucket = {
    d: ['.f1{color:red}', ['.f2{padding:10px}', { p: -1 }]],
    h: ['.f3:hover{color:blue}'],
    m: [['.f4{color:orange}', { m: '(min-width: 800px)' }]],
  };

  it('emits markers around each bucket-entry block by default', () => {
    const css = generateCSSRules(sample);
    expect(css).toContain('/** @griffel:css-start [d] null **/');
    expect(css).toContain('/** @griffel:css-start [d] {"p":-1} **/');
    expect(css).toContain('/** @griffel:css-end **/');
    // No @layer in default mode.
    expect(css).not.toContain('@layer');
  });

  it("wraps each block in @layer when wrapInLayer is true", () => {
    const css = generateCSSRules(sample, { wrapInLayer: true });
    // Marker comments stay outside the wrapper.
    expect(css).toMatch(/\/\*\* @griffel:css-start \[d\] null \*\*\/\s*\n\s*@layer griffel\.d \{/);
    expect(css).toMatch(/\/\*\* @griffel:css-start \[d\] \{"p":-1\} \*\*\/\s*\n\s*@layer griffel\.d\.s-1 \{/);
    expect(css).toMatch(/\/\*\* @griffel:css-start \[h\] null \*\*\/\s*\n\s*@layer griffel\.h \{/);
    // Media block uses a placeholder layer.
    expect(css).toMatch(
      /\/\*\* @griffel:css-start \[m\] \{"m":"\(min-width: 800px\)"\} \*\*\/\s*\n\s*@layer griffel\.m\.__griffelmq_[a-z0-9]+__ \{/,
    );
    // The end markers still close blocks.
    expect((css.match(/@griffel:css-end/g) ?? []).length).toBe(4);
    // The @layer block is closed with a single } before each end marker.
    expect(css).toMatch(/\}\s*\/\*\* @griffel:css-end \*\*\//);
  });
});
