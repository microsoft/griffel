import * as CSS from 'csstype';
import { UNSUPPORTED_CSS_PROPERTIES } from './constants';

export type GriffelStylesCSSValue = string | 0;

export type GriffelStylesUnsupportedCSSProperties = Record<keyof typeof UNSUPPORTED_CSS_PROPERTIES, never>;

export type ValueOrArray<T> = T | Array<T>;

type GriffelStylesCSSProperties = Omit<
  CSS.PropertiesFallback<GriffelStylesCSSValue>,
  // We have custom definition for "animationName"
  'animationName'
> &
  Partial<GriffelStylesUnsupportedCSSProperties>;

export type GriffelStylesStrictCSSObject = GriffelStylesCSSProperties &
  GriffelStylesCSSPseudos & {
    animationName?: GriffelAnimation | GriffelAnimation[] | CSS.Property.Animation;
  };

type GriffelStylesCSSPseudos = {
  [Property in CSS.Pseudos]?:
    | (GriffelStylesStrictCSSObject & { content?: string | string[] })
    | (GriffelStylesCSSObjectCustomL1 & { content?: string | string[] });
};

//
// "GriffelStylesCSSObjectCustom*" is a workaround to avoid circular references in types that are breaking TS <4.
// Once we will support "typesVersions" (types downleleving) or update our requirements for TS this should be
// updated or removed.
//

type GriffelStylesCSSObjectCustomL1 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelStylesCSSObjectCustomL2;
} & GriffelStylesStrictCSSObject;

type GriffelStylesCSSObjectCustomL2 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelStylesCSSObjectCustomL3;
} & GriffelStylesStrictCSSObject;

type GriffelStylesCSSObjectCustomL3 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelStylesCSSObjectCustomL4;
} & GriffelStylesStrictCSSObject;

type GriffelStylesCSSObjectCustomL4 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelStylesCSSObjectCustomL5;
} & GriffelStylesStrictCSSObject;

type GriffelStylesCSSObjectCustomL5 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelStylesStrictCSSObject;
} & GriffelStylesStrictCSSObject;

export type GriffelStyle = GriffelStylesStrictCSSObject | GriffelStylesCSSObjectCustomL1;

export type GriffelAnimation = Record<'from' | 'to' | string, GriffelStylesCSSObjectCustomL1>;

export interface MakeStylesOptions {
  dir: 'ltr' | 'rtl';
  renderer: GriffelRenderer;
}

export type GriffelStaticStyle = {
  [key: string]: CSS.Properties &
    // TODO Questionable: how else would users target their own children?
    Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
} & {
  '@font-face'?: {
    fontFamily: string;
    src: string;

    fontFeatureSettings?: string;
    fontStretch?: string;
    fontStyle?: string;
    fontVariant?: string;
    fontVariationSettings?: string;
    fontWeight?: number | string;

    unicodeRange?: string;
  };
};
export type GriffelStaticStyles = GriffelStaticStyle | string;

export interface MakeStaticStylesOptions {
  renderer: GriffelRenderer;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IsomorphicStyleElement extends Pick<HTMLStyleElement, 'dataset' | 'setAttribute' | 'media'> {
  __attributes?: Record<string, string>;
  sheet: IsomorphicCSSStyleSheet;
}

export interface IsomorphicCSSStyleSheet extends Pick<CSSStyleSheet, 'insertRule' | 'cssRules'> {
  __cssRules?: string[];
}

export interface GriffelRenderer {
  id: string;

  /**
   * @private
   */
  insertionCache: Record<string, string>;

  /**
   * @private
   */
  styleElements: Partial<Record<StyleBucketName, IsomorphicStyleElement>>;

  /**
   * @private
   */
  insertCSSRules(cssRules: CSSRulesByBucket): void;
}

export type StyleBucketName = keyof CSSRulesByBucket;
export type CSSRulesByBucket = {
  // default
  d?: CSSBucketEntry[];
  //  link
  l?: CSSBucketEntry[];
  //  visited
  v?: CSSBucketEntry[];
  //  focus-within
  w?: CSSBucketEntry[];
  //  focus
  f?: CSSBucketEntry[];
  //  focus-visible
  i?: CSSBucketEntry[];
  //  hover
  h?: CSSBucketEntry[];
  //  active
  a?: CSSBucketEntry[];
  //  @keyframes definitions
  k?: CSSBucketEntry[];
  //  at-rules (@support, @layer)
  t?: CSSBucketEntry[];
  //  @media rules
  m?: CSSBucketEntry[];
};

export type CSSBucketEntry = string | CSSRuleWithMeta;

/**
 * Some CSS buckets are specific to the rule itself (i.e. media queries)
 * In this case, store additional metadata for the renderer
 */
export interface CSSRuleWithMeta {
  /** CSS rule */
  r: string;
  [key: string]: unknown;
}

export type SequenceHash = string;
export type PropertyHash = string;

export type CSSClasses = /* ltrClassName */ string | [/* ltrClassName */ string, /* rtlClassName */ string];

export type CSSClassesMap = Record<PropertyHash, CSSClasses>;
export type CSSClassesMapBySlot<Slots extends string | number> = Record<Slots, CSSClassesMap>;

export type StylesBySlots<Slots extends string | number> = Record<Slots, GriffelStyle>;

export type LookupItem = [/* definitions */ CSSClassesMap, /* dir */ 'rtl' | 'ltr'];
