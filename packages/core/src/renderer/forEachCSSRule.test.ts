import { describe, expect, test } from 'vitest';
import { forEachCSSRule } from './forEachCSSRule.js';

function split(cssText: string): string[] {
  const cssRules: string[] = [];

  forEachCSSRule(cssText, cssRule => cssRules.push(cssRule));

  return cssRules;
}

/**
 * Every case joins its rules the way `renderToStyleElements()` does (`cssRules.join('')`) and
 * asserts they come back byte for byte — that identity is what makes `renderer.insertionCache`
 * hits work, since the cache is keyed by the rule string. It holds because these fixtures are in
 * the same canonical form `compileCSSRules()` produces at runtime.
 */
function expectRoundTrip(cssRules: string[]): void {
  expect(split(cssRules.join(''))).toEqual(cssRules);
}

describe('forEachCSSRule', () => {
  test('splits plain rules', () => {
    expectRoundTrip(['.fj{color:red;}', '.fk{color:blue;}']);
  });

  test('splits rules with pseudo selectors', () => {
    expectRoundTrip(['.fn:hover{color:red;}', '.fo:focus-visible{color:blue;}']);
  });

  test('splits rules with combinators', () => {
    expectRoundTrip(['.fa .foo{color:red;}', '.fb>span{color:blue;}']);
  });

  test('returns nothing for empty input', () => {
    expect(split('')).toEqual([]);
    expect(split('   \n  ')).toEqual([]);
  });

  describe('at-rules', () => {
    test('splits "@media" rules', () => {
      expectRoundTrip(['@media (min-width: 100px){.fh{color:red;}}', '@media (min-width: 100px){.fi{color:blue;}}']);
    });

    test('splits "@keyframes" rules', () => {
      expectRoundTrip([
        '@keyframes f1{0%{opacity:0;}100%{opacity:1;}}',
        '@keyframes f2{from{opacity:0;}to{opacity:1;}}',
        '@-webkit-keyframes f3{from{opacity:0;}to{opacity:1;}}',
      ]);
    });

    test('splits "@container" rules', () => {
      expectRoundTrip(['@container slot (min-width:480px){.fm{color:red;}}', '@container slot{.fn{color:blue;}}']);
    });

    test('splits "@supports" rules', () => {
      expectRoundTrip(['@supports (display:grid){.fd{color:red;}}', '.fe{color:blue;}']);
    });

    test('splits "@font-face" rules', () => {
      expectRoundTrip(['@font-face{font-family:"X";src:url(a.woff2);}', '.ff{color:red;}']);
    });

    // 🐛 The previous regex based implementation glued a block-less "@layer" statement together
    // with the rule that followed it, producing a key that matched nothing.
    test('splits block-less at-rule statements', () => {
      expectRoundTrip(['@layer base,utils;', '@layer base{.fc{color:red;}}']);
    });

    // 🐛 The previous implementation stopped at the first "}" pair, truncating the outer at-rule.
    test('splits nested at-rules', () => {
      expectRoundTrip([
        '@supports (display:grid){@media (min-width:100px){.fd{color:red;}}}',
        '@media (min-width:100px){@supports (display:grid){@layer base{.fe{color:blue;}}}}',
        '.ff{color:lime;}',
      ]);
    });
  });

  describe('"@scope" rules', () => {
    test('splits a single "@scope" rule', () => {
      expectRoundTrip(['@scope (.a) to (.b){:scope .c{color:red;}}']);
    });

    // 🐛 The previous implementation mutated the text it was matching against while a stateful
    // global regex held a "lastIndex" into it, so every "@scope" rule after the first came back
    // corrupted — leaving the real rule uncached and re-inserted on the client.
    test('splits consecutive "@scope" rules', () => {
      expectRoundTrip([
        '@scope (.a) to (.b){:scope .c{color:red;}}',
        '@scope (.d) to (.e){:scope .f{color:blue;}}',
        '@scope (.g) to (.h){:scope .i{color:lime;}}',
      ]);
    });

    test('splits "@scope" rules mixed with plain rules', () => {
      expectRoundTrip([
        '.fa{color:red;}',
        '@scope (.a) to (.b){:scope .c{color:red;}}',
        '.fb{color:blue;}',
        '@scope (.d) to (.e){:scope .f{color:lime;}}',
      ]);
    });

    test('splits "@scope" nested in "@media"', () => {
      expectRoundTrip(['@media (min-width:100px){@scope (.a) to (.b){:scope .c{color:red;}}}']);
    });
  });

  describe('braces that are data, not structure', () => {
    // 🐛 The previous implementation cut the rule at the "}" inside the string literal.
    test('ignores braces inside double quoted values', () => {
      expectRoundTrip(['.fa{content:"}";}', '.fb{color:red;}']);
      expectRoundTrip(['.fc{content:"{";}', '.fd{color:red;}']);
    });

    test('ignores braces inside single quoted values', () => {
      expectRoundTrip([".fa{content:'}';}", '.fb{color:red;}']);
    });

    test('ignores semicolons inside quoted values', () => {
      expectRoundTrip(['.fa{content:";";}', '.fb{color:red;}']);
    });

    test('ignores braces inside "url()"', () => {
      expectRoundTrip(['.fr{background-image:url("a}b.png");}', '.fs{color:red;}']);
    });

    test('handles escaped quotes inside values', () => {
      expectRoundTrip(['.fa{content:"a\\"}b";}', '.fb{color:red;}']);
    });

    test('handles escaped characters in selectors', () => {
      expectRoundTrip(['.f\\@md{color:red;}', '.fb{color:blue;}']);
    });
  });

  describe('nesting', () => {
    test('flattens nested rules the same way they were emitted', () => {
      // Griffel already emits flattened CSS, so this only pins that re-parsing agrees with the
      // compile step rather than inventing a different split.
      expect(split('.ff{color:red;&:hover{color:blue;}}.fg{color:lime;}')).toEqual([
        '.ff{color:red;}',
        '.ff:hover{color:blue;}',
        '.fg{color:lime;}',
      ]);
    });
  });

  describe('normalization', () => {
    test('trims whitespace between rules', () => {
      expect(split('\n  .foo{color:red;}\n  .bar{color:blue;}\n')).toEqual(['.foo{color:red;}', '.bar{color:blue;}']);
    });

    // Cache keys have to match the rules the runtime produces, and those are always minified by
    // the same `stringify`. Recovering the canonical form — rather than the literal bytes — means
    // rehydration still works when something reformats the CSS between the server and the browser.
    test('normalizes reformatted CSS back to the form the runtime emits', () => {
      expect(split('.foo { color: red; }')).toEqual(['.foo{color:red;}']);
      expect(split('@media (min-width: 100px) {\n  .foo { color: red; }\n}')).toEqual([
        '@media (min-width: 100px){.foo{color:red;}}',
      ]);
    });

    test('drops comments', () => {
      expect(split('/* a */.foo{color:red;}/* b */.bar{color:blue;}')).toEqual([
        '.foo{color:red;}',
        '.bar{color:blue;}',
      ]);
      expect(split('.foo{/* c */color:red;}')).toEqual(['.foo{color:red;}']);
    });

    test('does not treat a brace inside a comment as structure', () => {
      expect(split('/* } */.foo{color:red;}')).toEqual(['.foo{color:red;}']);
    });
  });

  describe('malformed input', () => {
    test('closes an unterminated trailing rule', () => {
      expect(split('.foo{color:red;}.bar{color:blue;')).toEqual(['.foo{color:red;}', '.bar{color:blue;}']);
    });

    test('ignores a leading stray closing brace', () => {
      expect(split('}.foo{color:red;}')).toEqual([]);
    });

    test('does not hang on an unterminated string', () => {
      expect(split('.foo{content:"abc')).toEqual(['.foo{content:"abc;}']);
    });

    test('does not hang on an unterminated comment', () => {
      expect(split('.foo{color:red;}/* abc')).toEqual(['.foo{color:red;}']);
    });
  });
});
