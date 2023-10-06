import type { GriffelStylesCSSValue, ValueOrArray } from '@griffel/style-types';
import type * as CSS from 'csstype';

export type BorderWidthInput = ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>> | null;
export type BorderStyleInput = ValueOrArray<CSS.Property.BorderStyle> | null;
export type BorderColorInput = ValueOrArray<CSS.Property.BorderColor> | null;

export type OutlineWidthInput = ValueOrArray<CSS.Property.OutlineWidth<GriffelStylesCSSValue>> | null;
export type OutlineStyleInput = ValueOrArray<CSS.Property.OutlineStyle> | null;
export type OutlineColorInput = ValueOrArray<CSS.Property.OutlineColor> | null;

export type BorderRadiusInput = ValueOrArray<CSS.Property.BorderRadius<GriffelStylesCSSValue>> | null;

export type GapInput = ValueOrArray<CSS.Property.Gap<GriffelStylesCSSValue>> | null;

export type GridAreaInput = CSS.Property.GridArea | null;

export type MarginInput = ValueOrArray<CSS.Property.Margin<GriffelStylesCSSValue>> | null;
export type MarginBlockInput = ValueOrArray<CSS.Property.MarginBlock<GriffelStylesCSSValue>> | null;
export type MarginInlineInput = ValueOrArray<CSS.Property.MarginInline<GriffelStylesCSSValue>> | null;

export type OverflowInput = ValueOrArray<CSS.Property.Overflow> | null;

export type PaddingInput = ValueOrArray<CSS.Property.Padding<GriffelStylesCSSValue>> | null;
export type PaddingBlockInput = ValueOrArray<CSS.Property.MarginBlock<GriffelStylesCSSValue>> | null;
export type PaddingInlineInput = ValueOrArray<CSS.Property.MarginInline<GriffelStylesCSSValue>> | null;

export type InsetInput = ValueOrArray<CSS.Property.Inset<GriffelStylesCSSValue>> | null;

export type FlexInput = [CSS.Property.Flex | null, (CSS.Property.Flex | null)?, (CSS.Property.Flex | null)?];

export type TransitionPropertyInput = CSS.Property.TransitionProperty | null;
export type TransitionDurationInput = CSS.Property.TransitionDuration | null;
export type TransitionDelayInput = CSS.Property.TransitionDelay | null;
export type TransitionTimingFunctionInput = CSS.Property.TransitionTimingFunction | null;
export type TransitionGlobalInput = CSS.Globals | null;

export type TextDecorationStyleInput = CSS.Property.TextDecorationStyle | null;
export type TextDecorationLineInput = ValueOrArray<CSS.Property.TextDecorationLine> | null;
export type TextDecorationColorInput = ValueOrArray<CSS.Property.TextDecorationColor> | null;
export type TextDecorationThicknessInput = ValueOrArray<CSS.Property.TextDecorationThickness> | null;
