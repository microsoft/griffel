/// <reference types="jest" />

import * as prettier from 'prettier';

import { resolveStyleRules } from '../runtime/resolveStyleRules';
import { normalizeCSSBucketEntry } from '../runtime/utils/normalizeCSSBucketEntry';
import type { CSSRulesByBucket, GriffelRenderer } from '../types';
import { resolveResetStyleRules } from '../runtime/resolveResetStyleRules';

// eslint-disable-next-line eqeqeq
const isObject = (value: unknown) => value != null && !Array.isArray(value) && typeof value === 'object';

export const griffelRendererSerializer: jest.SnapshotSerializerPlugin = {
  test(value) {
    return isObject(value) && isObject(value.stylesheets);
  },
  print(value) {
    /**
     * test function makes sure that value is the guarded type
     */
    const _value = value as GriffelRenderer;

    const stylesheetKeys = Object.keys(_value.stylesheets) as (keyof (typeof _value)['stylesheets'])[];

    const rules = stylesheetKeys.reduce((acc, styleEl) => {
      const stylesheet = _value.stylesheets[styleEl];

      if (stylesheet) {
        const cssRules = stylesheet.cssRules() ?? ([] as string[]);

        if (cssRules.length === 0) {
          return acc;
        }

        return [...acc, `/** bucket "${styleEl}" **/`, ...cssRules];
      }

      return acc;
    }, [] as string[]);

    return prettier.format(rules.join('\n'), { parser: 'css' }).trim();
  },
};

type StyleRulesTuple = ReturnType<typeof resolveStyleRules>;
const isStyleRulesTuple = (value: unknown): value is StyleRulesTuple => Array.isArray(value) && value.length === 2;

export const griffelRulesSerializer: jest.SnapshotSerializerPlugin = {
  test(value) {
    return isStyleRulesTuple(value);
  },
  print(value) {
    /**
     * test function makes sure that value is the guarded type
     */
    const _value = value as StyleRulesTuple;

    const cssRulesByBucket = _value[1];
    const keys = Object.keys(cssRulesByBucket) as (keyof typeof cssRulesByBucket)[];

    return keys.reduce((acc, styleBucketName) => {
      const rules = cssRulesByBucket[styleBucketName]!.map(entry => normalizeCSSBucketEntry(entry)[0]);

      return prettier.format(acc + rules.join(''), { parser: 'css' }).trim();
    }, '');
  },
};

export const griffelResetRulesSerializer: jest.SnapshotSerializerPlugin = {
  test(value) {
    return Array.isArray(value);
  },
  print(value) {
    const format = (cssRules: string[]) => prettier.format(cssRules.join(''), { parser: 'css' }).trim();

    /**
     * test function makes sure that value is the guarded type
     */
    const _value = value as ReturnType<typeof resolveResetStyleRules>;
    const cssRulesByBucket: CSSRulesByBucket = Array.isArray(_value[2]) ? { r: _value[2] } : _value[2];

    return Object.entries(cssRulesByBucket)
      .filter(([key, value]) => value.length > 0)
      .flatMap(([key, value]) => [`/** bucket "${key}" */`, format(value as string[])])
      .join('\n');
  },
};
