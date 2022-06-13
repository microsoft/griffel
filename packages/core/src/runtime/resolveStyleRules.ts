import hashString from '@emotion/hash';
import { convert, convertProperty } from 'rtl-css-js/core';

import { HASH_PREFIX } from '../constants';
import { GriffelStyle, CSSClassesMap, StyleBucketName, GriffelAnimation, CSSRuleData } from '../types';
import { compileCSS, CompileCSSOptions } from './compileCSS';
import { compileKeyframeRule, compileKeyframesCSS } from './compileKeyframeCSS';
import { generateCombinedQuery } from './utils/generateCombinedMediaQuery';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isLayerSelector } from './utils/isLayerSelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isSupportQuerySelector } from './utils/isSupportQuerySelector';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';
import { isObject } from './utils/isObject';
import { getStyleBucketName } from './getStyleBucketName';
import { hashClassName } from './utils/hashClassName';
import { hashPropertyKey } from './utils/hashPropertyKey';
import { UNSUPPORTED_CSS_PROPERTIES } from '..';

function pushToClassesMap(
  classesMap: CSSClassesMap,
  propertyKey: string,
  ltrClassname: string,
  rtlClassname: string | undefined,
) {
  classesMap[propertyKey] = rtlClassname ? [ltrClassname!, rtlClassname] : ltrClassname;
}

function pushToCSSRules(
  cssRules: CSSRuleData[],
  styleBucketName: StyleBucketName,
  ltrCSS: string,
  rtlCSS: string | undefined,
) {
  cssRules.push([ltrCSS, styleBucketName]);
  if (rtlCSS) {
    cssRules.push([rtlCSS, styleBucketName]);
  }
}

/**
 * Transforms input styles to classes maps & CSS rules.
 *
 * @internal
 */
export function resolveStyleRules(
  styles: GriffelStyle,
  pseudo = '',
  media = '',
  layer = '',
  support = '',
  cssClassesMap: CSSClassesMap = {},
  cssRules: CSSRuleData[] = [],
  rtlValue?: string,
): [CSSClassesMap, CSSRuleData[]] {
  // eslint-disable-next-line guard-for-in
  for (const property in styles) {
    // eslint-disable-next-line no-prototype-builtins
    if (UNSUPPORTED_CSS_PROPERTIES.hasOwnProperty(property)) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          [
            `@griffel/react: You are using unsupported shorthand CSS property "${property}". ` +
              `Please check your "makeStyles" calls, there *should not* be following:`,
            ' '.repeat(2) + `makeStyles({`,
            ' '.repeat(4) + `[slot]: { ${property}: "${styles[property as keyof GriffelStyle]}" }`,
            ' '.repeat(2) + `})`,
            '',
            'Learn why CSS shorthands are not supported: https://aka.ms/griffel-css-shorthands',
          ].join('\n'),
        );
      }
      continue;
    }

    const value = styles[property as keyof GriffelStyle];

    // eslint-disable-next-line eqeqeq
    if (value == null) {
      continue;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      // uniq key based on a hash of property & selector, used for merging later
      const key = hashPropertyKey(pseudo, media, support, property);
      const className = hashClassName({
        media,
        layer,
        value: value.toString(),
        support,
        pseudo,
        property,
      });

      const rtlDefinition = (rtlValue && { key: property, value: rtlValue }) || convertProperty(property, value);
      const flippedInRtl = rtlDefinition.key !== property || rtlDefinition.value !== value;

      const rtlClassName = flippedInRtl
        ? hashClassName({
            value: rtlDefinition.value.toString(),
            property: rtlDefinition.key,
            pseudo,
            media,
            layer,
            support,
          })
        : undefined;
      const rtlCompileOptions: Partial<CompileCSSOptions> | undefined = flippedInRtl
        ? {
            rtlClassName,
            rtlProperty: rtlDefinition.key,
            rtlValue: rtlDefinition.value,
          }
        : undefined;

      const styleBucketName = getStyleBucketName(pseudo, layer, media, support);
      const [ltrCSS, rtlCSS] = compileCSS({
        className,
        media,
        layer,
        pseudo,
        property,
        support,
        value,
        ...rtlCompileOptions,
      });

      pushToClassesMap(cssClassesMap, key, className, rtlClassName);
      pushToCSSRules(cssRules, styleBucketName, ltrCSS, rtlCSS);
    } else if (property === 'animationName') {
      const animationNameValue = Array.isArray(value) ? (value as GriffelAnimation[]) : [value as GriffelAnimation];

      const animationNames: string[] = [];
      const rtlAnimationNames: string[] = [];

      for (const keyframeObject of animationNameValue) {
        const keyframeCSS = compileKeyframeRule(keyframeObject);
        const rtlKeyframeCSS = compileKeyframeRule(convert(keyframeObject));

        const animationName = HASH_PREFIX + hashString(keyframeCSS);
        let rtlAnimationName: string;

        const keyframeRules = compileKeyframesCSS(animationName, keyframeCSS);
        let rtlKeyframeRules: string[] = [];

        if (keyframeCSS === rtlKeyframeCSS) {
          // If CSS for LTR & RTL are same we will re-use animationName from LTR to avoid duplication of rules in output
          rtlAnimationName = animationName;
        } else {
          rtlAnimationName = HASH_PREFIX + hashString(rtlKeyframeCSS);
          rtlKeyframeRules = compileKeyframesCSS(rtlAnimationName, rtlKeyframeCSS);
        }

        for (let i = 0; i < keyframeRules.length; i++) {
          pushToCSSRules(
            cssRules,
            // keyframes styles should be inserted into own bucket
            'k',
            keyframeRules[i],
            rtlKeyframeRules[i],
          );
        }

        animationNames.push(animationName);
        rtlAnimationNames.push(rtlAnimationName);
      }

      resolveStyleRules(
        { animationName: animationNames.join(', ') },
        pseudo,
        media,
        layer,
        support,
        cssClassesMap,
        cssRules,
        rtlAnimationNames.join(', '),
      );
    } else if (Array.isArray(value)) {
      // not animationName property but array in the value => fallback values
      if (value.length === 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `makeStyles(): An empty array was passed as input to "${property}", the property will be omitted in the styles.`,
          );
        }
        continue;
      }

      const key = hashPropertyKey(pseudo, media, support, property);
      const className = hashClassName({
        media,
        layer,
        value: value.map(v => (v ?? '').toString()).join(';'),
        support,
        pseudo,
        property,
      });

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

      const flippedInRtl = rtlDefinitions[0].key !== property || rtlDefinitions.some((v, i) => v.value !== value[i]);

      const rtlClassName = flippedInRtl
        ? hashClassName({
            value: rtlDefinitions.map(v => (v?.value ?? '').toString()).join(';'),
            property: rtlDefinitions[0].key,
            pseudo,
            layer,
            media,
            support,
          })
        : undefined;

      const rtlCompileOptions: Partial<CompileCSSOptions> | undefined = flippedInRtl
        ? {
            rtlClassName,
            rtlProperty: rtlDefinitions[0].key,
            rtlValue: rtlDefinitions.map(d => d.value) as Array<string | number>,
          }
        : undefined;

      const styleBucketName = getStyleBucketName(pseudo, layer, media, support);
      const [ltrCSS, rtlCSS] = compileCSS({
        className,
        media,
        layer,
        pseudo,
        property,
        support,
        value: value as Array<string | number>,
        ...rtlCompileOptions,
      });

      pushToClassesMap(cssClassesMap, key, className, rtlClassName);
      pushToCSSRules(cssRules, styleBucketName, ltrCSS, rtlCSS);
    } else if (isObject(value)) {
      if (isNestedSelector(property)) {
        resolveStyleRules(
          value as GriffelStyle,
          pseudo + normalizeNestedProperty(property),
          media,
          layer,
          support,
          cssClassesMap,
          cssRules,
        );
      } else if (isMediaQuerySelector(property)) {
        const combinedMediaQuery = generateCombinedQuery(media, property.slice(6).trim());

        resolveStyleRules(value as GriffelStyle, pseudo, combinedMediaQuery, layer, support, cssClassesMap, cssRules);
      } else if (isLayerSelector(property)) {
        const combinedLayerQuery = (layer ? `${layer}.` : '') + property.slice(6).trim();

        resolveStyleRules(value as GriffelStyle, pseudo, media, combinedLayerQuery, support, cssClassesMap, cssRules);
      } else if (isSupportQuerySelector(property)) {
        const combinedSupportQuery = generateCombinedQuery(support, property.slice(9).trim());

        resolveStyleRules(value as GriffelStyle, pseudo, media, layer, combinedSupportQuery, cssClassesMap, cssRules);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error(`Please fix the unresolved style rule: \n ${property} \n ${JSON.stringify(value, null, 2)}"`);
        }
      }
    }
  }

  return [cssClassesMap, cssRules];
}
