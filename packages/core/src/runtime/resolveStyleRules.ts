import hashString from '@emotion/hash';
import type { GriffelAnimation, GriffelStyle } from '@griffel/style-types';
import { convert, convertProperty } from 'rtl-css-js/core';

import { HASH_PREFIX, UNSUPPORTED_CSS_PROPERTIES } from '../constants';
import { CSSClassesMap, CSSRulesByBucket, StyleBucketName, CSSBucketEntry } from '../types';
import { compileAtomicCSSRule, CompileAtomicCSSOptions } from './compileAtomicCSSRule';
import { compileKeyframeRule, compileKeyframesCSS } from './compileKeyframeCSS';
import { generateCombinedQuery } from './utils/generateCombinedMediaQuery';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isLayerSelector } from './utils/isLayerSelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isSupportQuerySelector } from './utils/isSupportQuerySelector';
import { isContainerQuerySelector } from './utils/isContainerQuerySelector';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';
import { isObject } from './utils/isObject';
import { getStyleBucketName } from './getStyleBucketName';
import { hashClassName } from './utils/hashClassName';
import { hashPropertyKey } from './utils/hashPropertyKey';
import { trimSelector } from './utils/trimSelector';
import { warnAboutUnresolvedRule } from './warnings/warnAboutUnresolvedRule';
import { warnAboutUnsupportedProperties } from './warnings/warnAboutUnsupportedProperties';

function pushToClassesMap(
  classesMap: CSSClassesMap,
  propertyKey: string,
  ltrClassname: string,
  rtlClassname: string | undefined,
) {
  classesMap[propertyKey] = rtlClassname ? [ltrClassname!, rtlClassname] : ltrClassname;
}

function createBucketEntry(cssRule: string, metadata: Record<string, unknown> | undefined): CSSBucketEntry {
  if (metadata) {
    return [cssRule, metadata];
  }

  return cssRule;
}

function pushToCSSRules(
  cssRulesByBucket: CSSRulesByBucket,
  styleBucketName: StyleBucketName,
  ltrCSS: string | undefined,
  rtlCSS: string | undefined,
  media: string | undefined,
) {
  let metadata: Record<string, unknown> | undefined;
  if (styleBucketName === 'm' && media) {
    metadata = { m: media };
  }

  cssRulesByBucket[styleBucketName] ??= [];

  if (ltrCSS) {
    cssRulesByBucket[styleBucketName]!.push(createBucketEntry(ltrCSS, metadata));
  }

  if (rtlCSS) {
    cssRulesByBucket[styleBucketName]!.push(createBucketEntry(rtlCSS, metadata));
  }
}

/**
 * Transforms input styles to classes maps & CSS rules.
 *
 * @internal
 */
export function resolveStyleRules(
  styles: GriffelStyle,
  selectors: string[] = [],
  media = '',
  layer = '',
  support = '',
  container = '',
  cssClassesMap: CSSClassesMap = {},
  cssRulesByBucket: CSSRulesByBucket = {},
  rtlValue?: string,
): [CSSClassesMap, CSSRulesByBucket] {
  // eslint-disable-next-line guard-for-in
  for (const property in styles) {
    // eslint-disable-next-line no-prototype-builtins
    if (UNSUPPORTED_CSS_PROPERTIES.hasOwnProperty(property)) {
      warnAboutUnsupportedProperties(property, styles[property as keyof GriffelStyle]);
      continue;
    }

    const value = styles[property as keyof GriffelStyle];

    // eslint-disable-next-line eqeqeq
    if (value == null) {
      continue;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const selector = trimSelector(selectors.join(''));

      // uniq key based on a hash of property & selector, used for merging later
      const key = hashPropertyKey(selector, container, media, support, property);
      const className = hashClassName({
        container,
        media,
        layer,
        value: value.toString(),
        support,
        selector,
        property,
      });

      const rtlDefinition = (rtlValue && { key: property, value: rtlValue }) || convertProperty(property, value);
      const flippedInRtl = rtlDefinition.key !== property || rtlDefinition.value !== value;

      const rtlClassName = flippedInRtl
        ? hashClassName({
            container,
            value: rtlDefinition.value.toString(),
            property: rtlDefinition.key,
            selector,
            media,
            layer,
            support,
          })
        : undefined;
      const rtlCompileOptions: Partial<CompileAtomicCSSOptions> | undefined = flippedInRtl
        ? {
            rtlClassName,
            rtlProperty: rtlDefinition.key,
            rtlValue: rtlDefinition.value,
          }
        : undefined;

      const styleBucketName = getStyleBucketName(selectors, layer, media, support, container);
      const [ltrCSS, rtlCSS] = compileAtomicCSSRule({
        className,
        media,
        layer,
        selectors,
        property,
        support,
        container,
        value,
        ...rtlCompileOptions,
      });

      pushToClassesMap(cssClassesMap, key, className, rtlClassName);
      pushToCSSRules(cssRulesByBucket, styleBucketName, ltrCSS, rtlCSS, media);
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
            cssRulesByBucket,
            // keyframes styles should be inserted into own bucket
            'k',
            keyframeRules[i],
            rtlKeyframeRules[i],
            media,
          );
        }

        animationNames.push(animationName);
        rtlAnimationNames.push(rtlAnimationName);
      }

      resolveStyleRules(
        { animationName: animationNames.join(', ') },
        selectors,
        media,
        layer,
        support,
        container,
        cssClassesMap,
        cssRulesByBucket,
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

      const selector = trimSelector(selectors.join(''));

      const key = hashPropertyKey(selector, container, media, support, property);
      const className = hashClassName({
        container,
        media,
        layer,
        value: value.map(v => (v ?? '').toString()).join(';'),
        support,
        selector,
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
            container,
            value: rtlDefinitions.map(v => (v?.value ?? '').toString()).join(';'),
            property: rtlDefinitions[0].key,
            selector,
            layer,
            media,
            support,
          })
        : undefined;

      const rtlCompileOptions: Partial<CompileAtomicCSSOptions> | undefined = flippedInRtl
        ? {
            rtlClassName,
            rtlProperty: rtlDefinitions[0].key,
            rtlValue: rtlDefinitions.map(d => d.value) as unknown as Array<string | number>,
          }
        : undefined;

      const styleBucketName = getStyleBucketName(selectors, layer, media, support, container);
      const [ltrCSS, rtlCSS] = compileAtomicCSSRule({
        className,
        media,
        layer,
        selectors,
        property,
        support,
        container,
        value: value as unknown as Array<string | number>,
        ...rtlCompileOptions,
      });

      pushToClassesMap(cssClassesMap, key, className, rtlClassName);
      pushToCSSRules(cssRulesByBucket, styleBucketName, ltrCSS, rtlCSS, media);
    } else if (isObject(value)) {
      if (isNestedSelector(property)) {
        resolveStyleRules(
          value as GriffelStyle,
          selectors.concat(normalizeNestedProperty(property)),
          media,
          layer,
          support,
          container,
          cssClassesMap,
          cssRulesByBucket,
        );
      } else if (isMediaQuerySelector(property)) {
        const combinedMediaQuery = generateCombinedQuery(media, property.slice(6).trim());

        resolveStyleRules(
          value as GriffelStyle,
          selectors,
          combinedMediaQuery,
          layer,
          support,
          container,
          cssClassesMap,
          cssRulesByBucket,
        );
      } else if (isLayerSelector(property)) {
        const combinedLayerQuery = (layer ? `${layer}.` : '') + property.slice(6).trim();

        resolveStyleRules(
          value as GriffelStyle,
          selectors,
          media,
          combinedLayerQuery,
          support,
          container,
          cssClassesMap,
          cssRulesByBucket,
        );
      } else if (isSupportQuerySelector(property)) {
        const combinedSupportQuery = generateCombinedQuery(support, property.slice(9).trim());

        resolveStyleRules(
          value as GriffelStyle,
          selectors,
          media,
          layer,
          combinedSupportQuery,
          container,
          cssClassesMap,
          cssRulesByBucket,
        );
      } else if (isContainerQuerySelector(property)) {
        // TODO implement nested container queries if needed
        // The only way to target multiple containers is to nest container queries
        // https://developer.mozilla.org/en-US/docs/Web/CSS/@container#nested_container_queries
        const containerQuery = property.slice(10).trim();

        resolveStyleRules(
          value as GriffelStyle,
          selectors,
          media,
          layer,
          support,
          containerQuery,
          cssClassesMap,
          cssRulesByBucket,
        );
      } else {
        warnAboutUnresolvedRule(property, value);
      }
    }
  }

  return [cssClassesMap, cssRulesByBucket];
}
