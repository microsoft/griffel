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

export type GridAreaInput = CSS.Property.GridArea;

export type MarginInput = ValueOrArray<CSS.Property.Margin<GriffelStylesCSSValue>>;
export type MarginBlockInput = ValueOrArray<CSS.Property.MarginBlock<GriffelStylesCSSValue>>;
export type MarginInlineInput = ValueOrArray<CSS.Property.MarginInline<GriffelStylesCSSValue>>;

export type OverflowInput = ValueOrArray<CSS.Property.Overflow>;

export type PaddingInput = ValueOrArray<CSS.Property.Padding<GriffelStylesCSSValue>>;
export type PaddingBlockInput = ValueOrArray<CSS.Property.MarginBlock<GriffelStylesCSSValue>>;
export type PaddingInlineInput = ValueOrArray<CSS.Property.MarginInline<GriffelStylesCSSValue>>;

export type InsetInput = ValueOrArray<CSS.Property.Inset<GriffelStylesCSSValue>>;

export type FlexInput = [CSS.Property.Flex, CSS.Property.Flex?, CSS.Property.Flex?];

export type TransitionPropertyInput = CSS.Property.TransitionProperty;
export type TransitionDurationInput = CSS.Property.TransitionDuration;
export type TransitionDelayInput = CSS.Property.TransitionDelay;
export type TransitionTimingFunctionInput = CSS.Property.TransitionTimingFunction;
export type TransitionGlobalInput = CSS.Globals;

export type TextDecorationStyleInput = CSS.Property.TextDecorationStyle;
export type TextDecorationLineInput = ValueOrArray<CSS.Property.TextDecorationLine>;
export type TextDecorationColorInput = ValueOrArray<CSS.Property.TextDecorationColor>;
export type TextDecorationThicknessInput = ValueOrArray<CSS.Property.TextDecorationThickness>;
