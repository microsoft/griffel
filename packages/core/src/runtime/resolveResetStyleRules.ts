import hashString from '@emotion/hash';
import type { GriffelResetStyle, GriffelAnimation } from '@griffel/style-types';
import { convert, convertProperty } from 'rtl-css-js/core';

import { RESET_HASH_PREFIX } from '../constants.js';
import type { CSSRulesByBucket } from '../types.js';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector.js';
import { isLayerSelector } from './utils/isLayerSelector.js';
import { isNestedSelector } from './utils/isNestedSelector.js';
import { isScopeSelector } from './utils/isScopeSelector.js';
import { isSupportQuerySelector } from './utils/isSupportQuerySelector.js';
import { isObject } from './utils/isObject.js';
import { hyphenateProperty } from './utils/hyphenateProperty.js';
import { normalizePseudoSelector } from './compileAtomicCSSRule.js';
import { compileResetCSSRules } from './compileResetCSSRules.js';
import { compileKeyframeRule, compileKeyframesCSS } from './compileKeyframeCSS.js';
import { isContainerQuerySelector } from './utils/isContainerQuerySelector.js';
import { logError } from './warnings/logError.js';
import { warnAboutUnresolvedRule } from './warnings/warnAboutUnresolvedRule.js';

const SCOPE_ROOT_PLACEHOLDER = ':SELF:';

interface ScopeCollector {
  ltr: string[];
  rtl: string[];
}

/**
 * @internal
 */
function createStringFromStyles(styles: GriffelResetStyle, scopes?: ScopeCollector) {
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
        const [ltrNested, rtlNested] = createStringFromStyles(value, scopes);

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
        const [ltrNested, rtlNested] = createStringFromStyles(value, scopes);

        ltrCSS += `${property}{${ltrNested}}`;
        rtlCSS += `${property}{${rtlNested}}`;

        continue;
      }

      if (scopes && isScopeSelector(property)) {
        const scopeQuery = property.slice(6).trim();
        if (scopeQuery === '' || !scopeQuery.startsWith('to ')) {
          if (process.env.NODE_ENV !== 'production') {
            logError(
              `@griffel/react: "${property}" is not a supported @scope syntax. ` +
                'Use "@scope to (SELECTOR)" to define a scope boundary. ' +
                'The styles will be skipped.',
            );
          }
          continue;
        }

        // Emit the scope rule into the collector instead of inline. The body
        // is wrapped in `:scope { … }` so `&` inside resolves to the scope
        // root via CSS Nesting; `:SELF:` is replaced with the reset class
        // selector once the class name is known.
        const [ltrInner, rtlInner] = createStringFromStyles(value, scopes);
        scopes.ltr.push(`@scope (${SCOPE_ROOT_PLACEHOLDER}) ${scopeQuery}{:scope{${ltrInner}}}`);
        scopes.rtl.push(`@scope (${SCOPE_ROOT_PLACEHOLDER}) ${scopeQuery}{:scope{${rtlInner}}}`);

        continue;
      }
    }

    warnAboutUnresolvedRule(property, value as GriffelResetStyle);
  }

  return [ltrCSS, rtlCSS];
}

function substituteScopeRoot(rules: string[], classSelector: string): string {
  return rules.join('').split(SCOPE_ROOT_PLACEHOLDER).join(classSelector);
}

/**
 * @internal
 */
export function resolveResetStyleRules(
  styles: GriffelResetStyle,
  classNameHashSalt: string = '',
): [string, string | null, CSSRulesByBucket | string[]] {
  const scopes: ScopeCollector = { ltr: [], rtl: [] };
  const [ltrBody, rtlBody] = createStringFromStyles(styles, scopes);

  const ltrRule = ltrBody + scopes.ltr.join('');
  const rtlRule = rtlBody + scopes.rtl.join('');

  const ltrClassName = RESET_HASH_PREFIX + hashString(classNameHashSalt + ltrRule);
  const [ltrCSS, ltrCSSAtRules] = compileResetCSSRules(
    `.${ltrClassName}{${ltrBody}}` + substituteScopeRoot(scopes.ltr, `.${ltrClassName}`),
  );

  const hasAtRules = ltrCSSAtRules.length > 0;

  if (ltrRule === rtlRule) {
    return [ltrClassName, null, hasAtRules ? { r: ltrCSS, s: ltrCSSAtRules } : ltrCSS];
  }

  const rtlClassName = RESET_HASH_PREFIX + hashString(classNameHashSalt + rtlRule);
  const [rtlCSS, rtlCSSAtRules] = compileResetCSSRules(
    `.${rtlClassName}{${rtlBody}}` + substituteScopeRoot(scopes.rtl, `.${rtlClassName}`),
  );

  return [
    ltrClassName,
    rtlClassName,
    hasAtRules ? { r: ltrCSS.concat(rtlCSS), s: ltrCSSAtRules.concat(rtlCSSAtRules) } : ltrCSS.concat(rtlCSS),
  ];
}
