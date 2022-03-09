import * as CSS from 'csstype';
import type { GriffelStylesCSSProperties, GriffelStylesUnsupportedCSSProperties } from './types';

/*
 * Legacy types for TS <4. Maintained only for compatibility with TS 3.9.
 *
 * Used only during build, see "tools/createLegacyTypesForCore.mjs".
 */

export type GriffelStylesStrictCSSObject = GriffelStylesCSSProperties &
  GriffelStylesCSSPseudos & {
    animationName?: GriffelAnimation | GriffelAnimation[] | CSS.Property.Animation;
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
export type GriffelStyle = GriffelStylesCSSObjectCustomL1;
