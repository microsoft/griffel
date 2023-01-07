import type { CSSRulesByBucket } from '@griffel/core';
import { dedupeCSSRules } from './dedupeCSSRules';

describe('dedupeCSSRules', () => {
  it('dedupes simple rules', () => {
    const rules: CSSRulesByBucket = {
      d: ['.foo { color: red; }', '.foo { color: red; }', '.baz { color: pink }'],
    };

    expect(dedupeCSSRules(rules)).toMatchObject({
      d: ['.foo { color: red; }', '.baz { color: pink }'],
    });
  });

  it('dedupes rules with metadata', () => {
    const rules: CSSRulesByBucket = {
      m: [
        ['@media (min-width: 480px) { .foo { color: red; } }', { m: '(min-width: 480px)' }],
        ['@media (min-width: 480px) { .baz { color: pink; } }', { m: '(min-width: 480px)' }],

        ['@media (min-width: 600px) { .foo { color: red; } }', { m: '(min-width: 600px)' }],
        ['@media (min-width: 600px) { .foo { color: red; } }', { m: '(min-width: 600px)' }],
        ['@media (min-width: 600px) { .baz { color: pink; } }', { m: '(min-width: 600px)' }],
      ],
    };

    expect(dedupeCSSRules(rules)).toMatchObject({
      m: [
        ['@media (min-width: 480px) { .foo { color: red; } }', { m: '(min-width: 480px)' }],
        ['@media (min-width: 480px) { .baz { color: pink; } }', { m: '(min-width: 480px)' }],

        ['@media (min-width: 600px) { .foo { color: red; } }', { m: '(min-width: 600px)' }],
        ['@media (min-width: 600px) { .baz { color: pink; } }', { m: '(min-width: 600px)' }],
      ],
    });
  });
});
