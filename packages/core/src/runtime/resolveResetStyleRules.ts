import hashString from '@emotion/hash';
import type { GriffelResetStyle, GriffelAnimation } from '@griffel/style-types';
import { convert, convertProperty } from 'rtl-css-js/core';

import { RESET_HASH_PREFIX } from '../constants';
import type { CSSRulesByBucket } from '../types';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isLayerSelector } from './utils/isLayerSelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isSupportQuerySelector } from './utils/isSupportQuerySelector';
import { isObject } from './utils/isObject';
import { hyphenateProperty } from './utils/hyphenateProperty';
import { normalizePseudoSelector } from './compileAtomicCSSRule';
import { compileResetCSSRules } from './compileResetCSSRules';
import { compileKeyframeRule, compileKeyframesCSS } from './compileKeyframeCSS';
import { isContainerQuerySelector } from './utils/isContainerQuerySelector';
import { warnAboutUnresolvedRule } from './warnings/warnAboutUnresolvedRule';

/**
 * @internal
 */
function createStringFromStyles(styles: GriffelResetStyle) {
  let ltrCSS = '';
  let rtlCSS = '';

  // eslint-disable-next-line guard-for-in
  for (const property in styles) {
    const value = styles[property as keyof GriffelResetStyle];

    // eslint-disable-next-line eqeqeq
    if (value == null) {
      continue;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const { key: rtlProperty, value: rtlValue } = convertProperty(property, value);

      ltrCSS += `${hyphenateProperty(property)}:${value};`;
      rtlCSS += `${hyphenateProperty(rtlProperty)}:${rtlValue};`;

      continue;
    }

    if (property === 'animationName' && typeof value === 'object') {
      const values = Array.isArray(value) ? (value as GriffelAnimation[]) : [value as GriffelAnimation];

      const ltrAnimationNames: string[] = [];
      const rtlAnimationNames: string[] = [];

      for (const keyframeObject of values) {
        const ltrKeyframeRule = compileKeyframeRule(keyframeObject);
        const rtlKeyframeRule = compileKeyframeRule(convert(keyframeObject));

        const ltrAnimationName = RESET_HASH_PREFIX + hashString(ltrKeyframeRule);
        const rtlAnimationName = RESET_HASH_PREFIX + hashString(rtlKeyframeRule);

        ltrAnimationNames.push(ltrAnimationName);
        rtlAnimationNames.push(rtlAnimationName);

        ltrCSS += compileKeyframesCSS(ltrAnimationName, ltrKeyframeRule).join('');

        if (ltrAnimationName !== rtlAnimationName) {
          rtlCSS += compileKeyframesCSS(rtlAnimationName, rtlKeyframeRule).join('');
        }
      }

      ltrCSS += `animation-name:${ltrAnimationNames.join(',')};`;
      rtlCSS += `animation-name:${rtlAnimationNames.join(',')};`;

      continue;
    }

    if (Array.isArray(value)) {
      // not animationName property but array in the value => fallback values
      if (value.length === 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `makeResetStyles(): An empty array was passed as input to "${property}", the property will be omitted in the styles.`,
          );
        }
        continue;
      }

      const rtlDefinitions = value.map(v => convertProperty(property, v!));
      const rtlPropertyConsistent = !rtlDefinitions.some(v => v.key !== rtlDefinitions[0].key);

      if (!rtlPropertyConsistent) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            'makeStyles(): mixing CSS fallback values which result in multiple CSS properties in RTL is not supported.',
          );
        }
        continue;
      }

      const rtlProperty = rtlDefinitions[0].key;

      ltrCSS += value.map(v => `${hyphenateProperty(property)}:${v};`).join('');
      rtlCSS += rtlDefinitions.map(definition => `${hyphenateProperty(rtlProperty)}:${definition.value};`).join('');

      continue;
    }

    if (isObject(value)) {
      if (isNestedSelector(property)) {
        const nestedSelector = normalizePseudoSelector(property);
        const [ltrNested, rtlNested] = createStringFromStyles(value);

        ltrCSS += `${nestedSelector}{${ltrNested}}`;
        rtlCSS += `${nestedSelector}{${rtlNested}}`;

        continue;
      }

      if (
        isMediaQuerySelector(property) ||
        isLayerSelector(property) ||
        isSupportQuerySelector(property) ||
        isContainerQuerySelector(property)
      ) {
        const [ltrNested, rtlNested] = createStringFromStyles(value);

        ltrCSS += `${property}{${ltrNested}}`;
        rtlCSS += `${property}{${rtlNested}}`;

        continue;
      }
    }

    warnAboutUnresolvedRule(property, value as GriffelResetStyle);
  }

  return [ltrCSS, rtlCSS];
}

/**
 * @internal
 */
export function resolveResetStyleRules(
  styles: GriffelResetStyle,
): [string, string | null, CSSRulesByBucket | string[]] {
  const [ltrRule, rtlRule] = createStringFromStyles(styles);

  const ltrClassName = RESET_HASH_PREFIX + hashString(ltrRule);
  const [ltrCSS, ltrCSSAtRules] = compileResetCSSRules(`.${ltrClassName}{${ltrRule}}`);

  const hasAtRules = ltrCSSAtRules.length > 0;

  if (ltrRule === rtlRule) {
    return [ltrClassName, null, hasAtRules ? { r: ltrCSS, s: ltrCSSAtRules } : ltrCSS];
  }

  const rtlClassName = RESET_HASH_PREFIX + hashString(rtlRule);
  const [rtlCSS, rtlCSSAtRules] = compileResetCSSRules(`.${rtlClassName}{${rtlRule}}`);

  return [
    ltrClassName,
    rtlClassName,
    hasAtRules ? { r: ltrCSS.concat(rtlCSS), s: ltrCSSAtRules.concat(rtlCSSAtRules) } : ltrCSS.concat(rtlCSS),
  ];
}
