import * as CSS from 'csstype';
import type { GriffelStylesCSSValue, ValueOrArray } from './shared';

//
// Types for makeResetStyles()
// ---
//

type GriffelResetStylesCSSProperties = Omit<
  CSS.PropertiesFallback<ValueOrArray<GriffelStylesCSSValue>>,
  // We have custom definition for "animationName"
  'animationName'
>;

type GriffelResetStylesStrictCSSObject = GriffelResetStylesCSSProperties &
  GriffelResetStylesCSSPseudos & {
    animationName?: GriffelResetAnimation | GriffelResetAnimation[] | CSS.Property.Animation;
  };

type GriffelResetStylesCSSPseudos = {
  [Property in CSS.Pseudos]?:
    | (GriffelResetStylesStrictCSSObject & { content?: string | string[] })
    | (GriffelResetStylesCSSObjectCustomL1 & { content?: string | string[] });
};

//
// "GriffelStylesCSSObjectCustom*" is a workaround to avoid circular references in types that are breaking TS <4.
//

type GriffelResetStylesCSSObjectCustomL1 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelResetStylesCSSObjectCustomL2;
} & GriffelResetStylesStrictCSSObject;

type GriffelResetStylesCSSObjectCustomL2 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelResetStylesCSSObjectCustomL3;
} & GriffelResetStylesStrictCSSObject;

type GriffelResetStylesCSSObjectCustomL3 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelResetStylesCSSObjectCustomL4;
} & GriffelResetStylesStrictCSSObject;

type GriffelResetStylesCSSObjectCustomL4 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelResetStylesCSSObjectCustomL5;
} & GriffelResetStylesStrictCSSObject;

type GriffelResetStylesCSSObjectCustomL5 = {
  [Property: string]: string | number | (string | number)[] | undefined | GriffelResetStylesStrictCSSObject;
} & GriffelResetStylesStrictCSSObject;

export type GriffelResetStyle = GriffelResetStylesStrictCSSObject | GriffelResetStylesCSSObjectCustomL1;
export type GriffelResetAnimation = Record<'from' | 'to' | string, GriffelResetStyle>;
