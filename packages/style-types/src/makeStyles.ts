import type * as CSS from 'csstype';

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
> &
  Partial<GriffelStylesUnsupportedCSSProperties>;

export type GriffelStylesStrictCSSObject = GriffelStylesCSSProperties & {
  animationName?: GriffelAnimation | GriffelAnimation[] | string;
} & GriffelCSSPseudos;

type GriffelCSSObjectCustom = {
  [Property: string]: GriffelStyle | GriffelStylesCSSValue;
} & GriffelStylesStrictCSSObject;

type GriffelCSSPseudos = {
  [Property in CSS.Pseudos]?: GriffelStylesStrictCSSObject | GriffelCSSObjectCustom;
};

export type GriffelAnimation = Record<
  'from' | 'to' | string,
  GriffelStylesCSSProperties & { [Property in `--${string}`]: string }
>;
export type GriffelStyle = GriffelStylesStrictCSSObject | GriffelCSSObjectCustom;
