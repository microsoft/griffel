/// <reference types="jest" />

import * as prettier from 'prettier';

import { resolveStyleRules } from '../runtime/resolveStyleRules';
import type { GriffelRenderer } from '../types';

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

    const stylesheetKeys = Object.keys(_value.stylesheets) as (keyof typeof _value['stylesheets'])[];

    const rules = stylesheetKeys.reduce((acc, styleEl) => {
      const stylesheet = _value.stylesheets[styleEl]?.element;

      if (stylesheet) {
        const cssRules = stylesheet.sheet ? Array.from(stylesheet.sheet.cssRules) : [];

        return [...acc, ...cssRules.map(rule => rule.cssText)];
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
      const rules = cssRulesByBucket[styleBucketName]!;

      return prettier.format(acc + rules.join(''), { parser: 'css' }).trim();
    }, '');
  },
};
