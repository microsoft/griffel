import * as CSS from 'csstype';
import type { GriffelStylesCSSProperties, GriffelStylesCSSValue } from './types';

/*
 * Modern types that are compatible with TS >4.
 */

export type GriffelStylesStrictCSSObject = GriffelStylesCSSProperties &
  GriffelCSSPseudos & { animationName?: GriffelAnimation | GriffelAnimation[] | string };

type GriffelCSSObjectCustom = {
  [Property: string]: GriffelStyle | GriffelStylesCSSValue;
} & GriffelStylesStrictCSSObject;

type GriffelCSSPseudos = {
  [Property in CSS.Pseudos]?:
    | (GriffelStylesStrictCSSObject & { content?: string })
    | (GriffelCSSObjectCustom & { content?: string });
};

export type GriffelAnimation = Record<'from' | 'to' | string, GriffelCSSObjectCustom>;
export type GriffelStyle = GriffelStylesStrictCSSObject | GriffelCSSObjectCustom;
