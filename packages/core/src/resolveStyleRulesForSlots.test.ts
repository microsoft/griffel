import { describe, it, expect } from 'vitest';
import { resolveStyleRulesForSlots } from './resolveStyleRulesForSlots';
import type { StylesBySlots } from './types';

describe('resolveStyleRulesForSlots', () => {
  it('returns classnames and CSS rules to apply', () => {
    const stylesBySlots: StylesBySlots<'root' | 'icon'> = {
      root: { color: 'red', backgroundColor: 'pink' },
      icon: { color: 'blue', backgroundColor: 'lightblue' },
    };

    expect(resolveStyleRulesForSlots(stylesBySlots)).toMatchInlineSnapshot(`
      [
        {
          "icon": {
            "De3pzq": "f1ta0kgp",
            "sj55zd": "f163i14w",
          },
          "root": {
            "De3pzq": "fnf68zh",
            "sj55zd": "fe3e8s9",
          },
        },
        {
          "d": [
            ".fe3e8s9{color:red;}",
            ".fnf68zh{background-color:pink;}",
            ".f163i14w{color:blue;}",
            ".f1ta0kgp{background-color:lightblue;}",
          ],
        },
      ]
    `);
  });
});
