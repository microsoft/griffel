import * as CSS from 'csstype';
import { GriffelStylesCSSValue, ValueOrArray } from '../types';

export type BorderWidthInput = ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>;
export type BorderStyleInput = ValueOrArray<CSS.Property.BorderStyle>;
export type BorderColorInput = ValueOrArray<CSS.Property.BorderColor>;

export type BorderRadiusInput = ValueOrArray<CSS.Property.BorderRadius<GriffelStylesCSSValue>>;
