import * as CSS from 'csstype';
import { GriffelStylesCSSValue, ValueOrArray } from '../types';

export type BorderWidthInput = ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>;
export type BorderStyleInput = ValueOrArray<CSS.Property.BorderStyle>;
export type BorderColorInput = ValueOrArray<CSS.Property.BorderColor>;

export type OutlineWidthInput = ValueOrArray<CSS.Property.OutlineWidth<GriffelStylesCSSValue>>;
export type OutlineStyleInput = ValueOrArray<CSS.Property.OutlineStyle>;
export type OutlineColorInput = ValueOrArray<CSS.Property.OutlineColor>;

export type BorderRadiusInput = ValueOrArray<CSS.Property.BorderRadius<GriffelStylesCSSValue>>;

export type GapInput = ValueOrArray<CSS.Property.Gap<GriffelStylesCSSValue>>;

export type MarginInput = ValueOrArray<CSS.Property.Margin<GriffelStylesCSSValue>>;

export type OverflowInput = ValueOrArray<CSS.Property.Overflow>;

export type PaddingInput = ValueOrArray<CSS.Property.Padding<GriffelStylesCSSValue>>;

export type InsetInput = ValueOrArray<CSS.Property.Inset<GriffelStylesCSSValue>>;

export type FlexInput = [
  firstValue: CSS.Property.Flex,
  secondValue?: CSS.Property.Flex,
  thirdValue?: CSS.Property.Flex,
];
