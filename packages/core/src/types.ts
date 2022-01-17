import * as CSS from 'csstype';

export type GriffelStylesCSSValue = string | 0;

type GriffeltylesUnsupportedCSSProperties = {
  // We don't support expansion of CSS shorthands
  animation?: never;
  background?: never;
  border?: never;
  borderBlock?: never;
  borderBlockEnd?: never;
  borderBlockStart?: never;
  borderBottom?: never;
  borderColor?: never;
  borderImage?: never;
  borderInline?: never;
  borderInlineEnd?: never;
  borderInlineStart?: never;
  borderLeft?: never;
  borderRadius?: never;
  borderRight?: never;
  borderStyle?: never;
  borderTop?: never;
  borderWidth?: never;
  columnRule?: never;
  flex?: never;
  flexFlow?: never;
  font?: never;
  gap?: never;
  grid?: never;
  gridArea?: never;
  gridColumn?: never;
  gridGap?: never;
  gridRow?: never;
  gridTemplate?: never;
  listStyle?: never;
  margin?: never;
  mask?: never;
  maskBorder?: never;
  offset?: never;
  outline?: never;
  overflow?: never;
  padding?: never;
  placeItems?: never;
  placeSelf?: never;
  textDecoration?: never;
  textEmphasis?: never;
  transition?: never;
};
type GriffelStylesCSSProperties = Omit<
  CSS.Properties<GriffelStylesCSSValue>,
  // We have custom definition for "animationName" and "fontWeight"
  'animationName' | 'fontWeight'
> &
  GriffeltylesUnsupportedCSSProperties;

export type GriffelStylesStrictCSSObject = GriffelStylesCSSProperties &
  GriffelStylesCSSPseudos & {
    animationName?: GriffelStylesAnimation | GriffelStylesAnimation[] | CSS.AnimationProperty;
    fontWeight?: CSS.Properties['fontWeight'] | string;
  };

type GriffelStylesCSSPseudos = {
  [Property in CSS.Pseudos]?:
    | (GriffelStylesStrictCSSObject & { content?: string })
    | (GriffelStylesCSSObjectCustomL1 & { content?: string });
};

//
// "GriffelStylesCSSObjectCustom*" is a workaround to avoid circular references in types that are breaking TS <4.
// Once we will support "typesVersions" (types downleleving) or update our requirements for TS this should be
// updated or removed.
//

type GriffelStylesCSSObjectCustomL1 = {
  [Property: string]: GriffelStylesCSSValue | undefined | GriffelStylesCSSObjectCustomL2;
} & GriffelStylesStrictCSSObject;
type GriffelStylesCSSObjectCustomL2 = {
  [Property: string]: GriffelStylesCSSValue | undefined | GriffelStylesCSSObjectCustomL3;
} & GriffelStylesStrictCSSObject;
type GriffelStylesCSSObjectCustomL3 = {
  [Property: string]: GriffelStylesCSSValue | undefined | GriffelStylesCSSObjectCustomL4;
} & GriffelStylesStrictCSSObject;
type GriffelStylesCSSObjectCustomL4 = {
  [Property: string]: GriffelStylesCSSValue | undefined | GriffelStylesCSSObjectCustomL5;
} & GriffelStylesStrictCSSObject;
type GriffelStylesCSSObjectCustomL5 = {
  [Property: string]: GriffelStylesCSSValue | undefined;
} & GriffelStylesStrictCSSObject;

export type GriffelStylesAnimation = Record<'from' | 'to' | string, GriffelStylesCSSObjectCustomL1>;
export type GriffelStylesStyle = GriffelStylesStrictCSSObject | GriffelStylesCSSObjectCustomL1;

export interface GriffelStylesOptions {
  dir: 'ltr' | 'rtl';
  renderer: GriffelStylesRenderer;
}

export type GriffelStaticStylesStyle = {
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
export type GriffelStaticStyles = GriffelStaticStylesStyle | string;

export interface GriffelStaticStylesOptions {
  renderer: GriffelStylesRenderer;
}

export interface GriffelStylesRenderer {
  id: string;

  /**
   * @private
   */
  insertionCache: Record<string, StyleBucketName>;

  /**
   * @private
   */
  styleElements: Partial<Record<StyleBucketName, HTMLStyleElement>>;

  /**
   * @private
   */
  insertCSSRules(cssRules: CSSRulesByBucket): void;
}

/**
 * Buckets under which we will group our stylesheets.
 */
export type StyleBucketName =
  // default
  | 'd'
  // link
  | 'l'
  // visited
  | 'v'
  // focus-within
  | 'w'
  // focus
  | 'f'
  // focus-visible
  | 'i'
  // hover
  | 'h'
  // active
  | 'a'
  // @keyframes definitions
  | 'k'
  // at-rules (@media, @support)
  | 't';

export type SequenceHash = string;
export type PropertyHash = string;

export type CSSClasses = /* ltrClassName */ string | [/* ltrClassName */ string, /* rtlClassName */ string];

export type CSSClassesMap = Record<PropertyHash, CSSClasses>;
export type CSSClassesMapBySlot<Slots extends string | number> = Record<Slots, CSSClassesMap>;

export type CSSRulesByBucket = Partial<Record<StyleBucketName, string[]>>;

export type StylesBySlots<Slots extends string | number> = Record<Slots, GriffelStylesStyle>;

export type LookupItem = [/* definitions */ CSSClassesMap, /* dir */ 'rtl' | 'ltr'];
