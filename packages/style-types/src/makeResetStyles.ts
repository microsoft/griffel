import * as CSS from 'csstype';
import type { GriffelStylesCSSValue } from './shared';

//
// Types for makeResetStyles()
// ---
//

type GriffelResetStylesCSSProperties = Omit<
  CSS.PropertiesFallback<GriffelStylesCSSValue>,
  // We have custom definition for "animationName"
  'animationName'
>;

export type GriffelResetStylesStrictCSSObject = GriffelResetStylesCSSProperties &
  GriffelCSSPseudos & { animationName?: GriffelResetAnimation | GriffelResetAnimation[] | string };

type GriffelCSSObjectCustom = {
  [Property: string]: GriffelResetStyle | GriffelStylesCSSValue;
} & GriffelResetStylesStrictCSSObject;

type GriffelCSSPseudos = {
  [Property in CSS.Pseudos]?: GriffelResetStylesStrictCSSObject | GriffelCSSObjectCustom;
};

export type GriffelResetAnimation = Record<'from' | 'to' | string, GriffelResetStylesCSSProperties>;
export type GriffelResetStyle = GriffelResetStylesStrictCSSObject | GriffelCSSObjectCustom;
