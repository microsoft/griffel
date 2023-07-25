import type { GriffelStyle } from '@griffel/style-types';

export interface IsomorphicStyleSheet {
  /**
   * Attributes applied to the underlying HTMLStyleElement
   */
  elementAttributes: Record<string, string>;
  /**
   * Underlying HTMLStyleElement
   */
  element: HTMLStyleElement | undefined;
  bucketName: StyleBucketName;
  /**
   * Returns all CSS rules on the stylesheet
   */
  cssRules(): string[];
  insertRule(rule: string): number | undefined;
}

export interface GriffelRenderer {
  id: string;

  /**
   * @private
   */
  insertionCache: Record<string, StyleBucketName>;

  /**
   * @private
   */
  stylesheets: { [key in StyleBucketName]?: IsomorphicStyleSheet } & Record<string, IsomorphicStyleSheet>;

  /**
   * @private
   */
  styleElementAttributes?: Readonly<Record<string, string>>;

  /**
   * @private
   */
  insertCSSRules(cssRules: CSSRulesByBucket): void;

  /**
   * @private
   */
  compareMediaQueries(a: string, b: string): number;
}

/**
 * Buckets under which we will group our stylesheets.
 */
export type StyleBucketName = keyof CSSRulesByBucket;
export type SequenceHash = string;
export type PropertyHash = string;

export type CSSClasses = /* ltrClassName */ string | [/* ltrClassName */ string, /* rtlClassName */ string];

export type CSSClassesMap = Record<PropertyHash, CSSClasses>;
export type CSSClassesMapBySlot<Slots extends string | number> = Record<Slots, CSSClassesMap>;

export type CSSRulesByBucket = {
  // reset
  r?: CSSBucketEntry[];
  // default
  d?: CSSBucketEntry[];
  // link
  l?: CSSBucketEntry[];
  // visited
  v?: CSSBucketEntry[];
  // focus-within
  w?: CSSBucketEntry[];
  // focus
  f?: CSSBucketEntry[];
  // focus-visible
  i?: CSSBucketEntry[];
  // hover
  h?: CSSBucketEntry[];
  // active
  a?: CSSBucketEntry[];
  // @keyframes definitions
  k?: CSSBucketEntry[];
  // at-rules (@support, @layer)
  t?: CSSBucketEntry[];
  // @media rules
  m?: CSSBucketEntry[];
  // @container rules
  c?: CSSBucketEntry[];
};

export type GriffelInsertionFactory = () => (renderer: GriffelRenderer, cssRules: CSSRulesByBucket) => void;

/** @internal */
export type CSSBucketEntry = string | [string, Record<string, unknown>];

export type StylesBySlots<Slots extends string | number> = Record<Slots, GriffelStyle>;

export type LookupItem = [/* definitions */ CSSClassesMap, /* dir */ 'rtl' | 'ltr'];
