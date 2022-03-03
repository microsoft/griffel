import * as CSS from 'csstype';
import { UNSUPPORTED_CSS_PROPERTIES } from './constants';

export type GriffelStylesCSSValue = string | 0;

export type GriffelStylesUnsupportedCSSProperties = Record<keyof typeof UNSUPPORTED_CSS_PROPERTIES, never>;

type GriffelStylesCSSProperties = Omit<
  CSS.Properties<GriffelStylesCSSValue>,
  // We have custom definition for "animationName" and "fontWeight"
  'animationName' | 'fontWeight'
> &
  Partial<GriffelStylesUnsupportedCSSProperties>;

export type GriffelStylesStrictCSSObject = GriffelStylesCSSProperties &
  GriffelStylesCSSPseudos & {
    animationName?: GriffelAnimation | GriffelAnimation[] | CSS.Property.Animation;
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

type GriffelStylesCSSObjectCustomL1 =
  | ({
      [Property: string]: string | undefined | GriffelStylesCSSObjectCustomL2;
    } & Partial<GriffelStylesUnsupportedCSSProperties>)
  | GriffelStylesStrictCSSObject;
type GriffelStylesCSSObjectCustomL2 =
  | ({
      [Property: string]: string | undefined | GriffelStylesCSSObjectCustomL3;
    } & Partial<GriffelStylesUnsupportedCSSProperties>)
  | GriffelStylesStrictCSSObject;
type GriffelStylesCSSObjectCustomL3 =
  | ({
      [Property: string]: string | undefined | GriffelStylesCSSObjectCustomL4;
    } & Partial<GriffelStylesUnsupportedCSSProperties>)
  | GriffelStylesStrictCSSObject;
type GriffelStylesCSSObjectCustomL4 =
  | ({
      [Property: string]: string | undefined | GriffelStylesCSSObjectCustomL5;
    } & Partial<GriffelStylesUnsupportedCSSProperties>)
  | GriffelStylesStrictCSSObject;
type GriffelStylesCSSObjectCustomL5 =
  | ({
      [Property: string]: string | undefined;
    } & Partial<GriffelStylesUnsupportedCSSProperties>)
  | GriffelStylesStrictCSSObject;

export type GriffelAnimation = Record<'from' | 'to' | string, GriffelStylesCSSObjectCustomL1>;
export type GriffelStyle = GriffelStylesStrictCSSObject | GriffelStylesCSSObjectCustomL1;

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

export interface GriffelRenderer {
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

export type StylesBySlots<Slots extends string | number> = Record<Slots, GriffelStyle>;

export type LookupItem = [/* definitions */ CSSClassesMap, /* dir */ 'rtl' | 'ltr'];
