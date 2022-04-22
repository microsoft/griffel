import * as CSS from 'csstype';
import { GriffelStylesCSSValue, ValueOrArray } from '../types';

export type BorderWidthInput = ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>;
export type BorderStyleInput = ValueOrArray<CSS.Property.BorderStyle>;
export type BorderColorInput = ValueOrArray<CSS.Property.BorderColor>;

export type BorderRadiusInput = ValueOrArray<CSS.Property.BorderRadius<GriffelStylesCSSValue>>;

export type GapInput = ValueOrArray<CSS.Property.Gap<GriffelStylesCSSValue>>;

export type MarginInput = ValueOrArray<CSS.Property.Margin<GriffelStylesCSSValue>>;

export type OverflowInput = ValueOrArray<CSS.Property.Overflow>;

export type PaddingInput = ValueOrArray<CSS.Property.Padding<GriffelStylesCSSValue>>;

export type InsetInput = ValueOrArray<CSS.Property.Inset<GriffelStylesCSSValue>>;
