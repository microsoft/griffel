import * as CSS from 'csstype';

import type { GriffelStylesCSSValue } from './shared';
import type { GriffelStylesUnsupportedCSSProperties } from './unsupported-properties';

//
// Types for makeStyles()
// ---
//

type GriffelStylesCSSProperties = Omit<
  CSS.PropertiesFallback<GriffelStylesCSSValue>,
  // We have custom definition for "animationName"
  'animationName'
> & { animationName?: GriffelAnimation | GriffelAnimation[] | string } & Partial<GriffelStylesUnsupportedCSSProperties>;

export type GriffelStylesStrictCSSObject = GriffelStylesCSSProperties & GriffelCSSPseudos;

type GriffelCSSObjectCustom = {
  [Property: string]: GriffelStyle | GriffelStylesCSSValue;
} & GriffelStylesStrictCSSObject;

type GriffelCSSPseudos = {
  [Property in CSS.Pseudos]?: GriffelStylesStrictCSSObject | GriffelCSSObjectCustom;
};

export type GriffelAnimation = Record<'from' | 'to' | string, GriffelCSSObjectCustom>;
export type GriffelStyle = GriffelStylesStrictCSSObject | GriffelCSSObjectCustom;
