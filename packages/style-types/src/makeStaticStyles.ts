import type * as CSS from 'csstype';
import type { GriffelStylesCSSValue, Fallback } from './shared';

//
// Types for makeStaticStyles()
// ---
//

export type GriffelStaticStyle = {
  [key: string]: (CSS.Properties | Fallback<CSS.Properties<GriffelStylesCSSValue>>) &
    // TODO Questionable: how else would users target their own children?
    Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
} & {
  '@font-face'?: {
    fontFamily: string;
    src: string;

    fontFeatureSettings?: string;
    fontStretch?: string;
    fontStyle?: string;
    fontVariant?: string;
    fontVariationSettings?: string;
    fontWeight?: number | string;

    unicodeRange?: string;
  };
};
export type GriffelStaticStyles = GriffelStaticStyle | string;
