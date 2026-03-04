import { describe, expect, it } from 'vitest';
import type { CSSRulesByBucket } from '@griffel/core';
import { ASSET_TAG_OPEN, ASSET_TAG_CLOSE } from '@griffel/transform';

import { resolveAssetPathsInCSSRules } from './resolveAssetPaths.mjs';

function tag(absolutePath: string): string {
  return ASSET_TAG_OPEN + absolutePath + ASSET_TAG_CLOSE;
}

describe('resolveAssetPathsInCSSRules', () => {
  it('resolves a single tagged asset path to relative', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: [`.foo{background-image:url(${tag('/project/src/blank.jpg')});}`],
    };

    const result = resolveAssetPathsInCSSRules(cssRulesByBucket, '/project/src/styles.ts');

    expect(result).toEqual({
      d: ['.foo{background-image:url(blank.jpg);}'],
    });
  });

  it('resolves multiple tagged paths in one rule', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: [`.foo{background-image:url(${tag('/project/src/a.jpg')}),url(${tag('/project/src/b.jpg')});}`],
    };

    const result = resolveAssetPathsInCSSRules(cssRulesByBucket, '/project/src/styles.ts');

    expect(result).toEqual({
      d: ['.foo{background-image:url(a.jpg),url(b.jpg);}'],
    });
  });

  it('leaves rules without tagged paths unchanged', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: ['.foo{color:red;}'],
    };

    const result = resolveAssetPathsInCSSRules(cssRulesByBucket, '/project/src/styles.ts');

    expect(result).toEqual({
      d: ['.foo{color:red;}'],
    });
  });

  it('handles array bucket entries [rule, metadata]', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: [[`.foo{background-image:url(${tag('/project/src/blank.jpg')});}`, { p: -1 }]],
    };

    const result = resolveAssetPathsInCSSRules(cssRulesByBucket, '/project/src/styles.ts');

    expect(result).toEqual({
      d: [['.foo{background-image:url(blank.jpg);}', { p: -1 }]],
    });
  });

  it('resolves paths relative to the source file directory', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: [`.foo{background-image:url(${tag('/project/assets/logo.png')});}`],
    };

    const result = resolveAssetPathsInCSSRules(cssRulesByBucket, '/project/src/styles.ts');

    expect(result).toEqual({
      d: ['.foo{background-image:url(../assets/logo.png);}'],
    });
  });

  it('handles multiple buckets', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: [`.foo{background-image:url(${tag('/project/src/bg.jpg')});}`],
      r: [`.bar{background-image:url(${tag('/project/src/reset.jpg')});}`],
    };

    const result = resolveAssetPathsInCSSRules(cssRulesByBucket, '/project/src/styles.ts');

    expect(result).toEqual({
      d: ['.foo{background-image:url(bg.jpg);}'],
      r: ['.bar{background-image:url(reset.jpg);}'],
    });
  });
});
