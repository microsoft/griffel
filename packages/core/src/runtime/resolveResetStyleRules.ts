import hashString from '@emotion/hash';
import { convertProperty } from 'rtl-css-js/core';

import { RESET_HASH_PREFIX } from '../constants';
import { GriffelStyle, GriffelResetStyle } from '../types';
import { compileCSSRules, normalizePseudoSelector } from './compileCSS';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isLayerSelector } from './utils/isLayerSelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isSupportQuerySelector } from './utils/isSupportQuerySelector';
import { isObject } from './utils/isObject';
import { hyphenateProperty } from './utils/hyphenateProperty';

/**
 * @internal
 */
export function createStringFromStyles(styles: GriffelResetStyle) {
  let ltrCSS = '';
  let rtlCSS = '';

  // eslint-disable-next-line guard-for-in
  for (const property in styles) {
    const value = styles[property as keyof GriffelStyle];

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

    if (property === 'animationName') {
      // TODO: handle animations
      throw new Error();
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

      if (isMediaQuerySelector(property) || isLayerSelector(property) || isSupportQuerySelector(property)) {
        const [ltrNested, rtlNested] = createStringFromStyles(value);

        ltrCSS += `${property}{${ltrNested}}`;
        rtlCSS += `${property}{${rtlNested}}`;

        continue;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(`Please fix the unresolved style rule: \n ${property} \n ${JSON.stringify(value, null, 2)}"`);
    }
  }

  return [ltrCSS, rtlCSS];
}

/**
 * @internal
 */
export function resolveResetStyleRules(styles: GriffelResetStyle): [string, string | null, string[]] {
  const [ltrRule, rtlRule] = createStringFromStyles(styles);

  const ltrClassName = RESET_HASH_PREFIX + hashString(ltrRule);
  const ltrCSS = compileCSSRules(`.${ltrClassName}{${ltrRule}}`);

  if (ltrRule === rtlRule) {
    return [ltrClassName, null, ltrCSS];
  }

  const rtlClassName = RESET_HASH_PREFIX + hashString(rtlRule);
  const rtlCSS = compileCSSRules(`.${rtlClassName}{${rtlRule}}`);

  return [ltrClassName, rtlClassName, ltrCSS.concat(rtlCSS)];
}
