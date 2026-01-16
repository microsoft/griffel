import type * as CSS from 'csstype';

import type { Fallback, GriffelStylesCSSValue } from './shared';
import type { GriffelStylesUnsupportedCSSProperties } from './unsupported-properties';

//
// Types for makeStyles()
// ---
//

type GriffelCSSProperties = Omit<
  Fallback<CSS.Properties<GriffelStylesCSSValue>>,
  // We have custom definition for "animationName"
  'animationName'
> &
  Partial<GriffelStylesUnsupportedCSSProperties> & {
    animationName?: GriffelAnimation | GriffelAnimation[] | string;
  };

/**
 * Type for CSS custom properties
 *
 * @example { "--foo": "bar" }
 */
type GriffelCSSCustomProperties = { [CustomProperty in `--${string}`]: string };

/**
 * Type for CSS pseudo-selectors (including more complex)
 *
 * @example { ":hover": { color: "red" } }
 * @example { ":hover > div": { color: "red" } }
 * @example { ":global(.foo)": { color: "red" } }
 */
type GriffelCSSPseudoSelectors = { [Selector in CSS.Pseudos | `${CSS.Pseudos | ':global'}${string}`]?: GriffelStyle };

/**
 * Type for CSS "&" selectors
 *
 * @example { "&.foo": { color: "red" } }
 * @example { "> div": { color: "red" } }
 * @example { "[data-attr]": { color: "red" } }
 * @example { "&.foo > div": { color: "red" } }
 * @example { "&.foo": { "&.bar": { color: "red" } } }
 */
type GriffelCSSAmpersandSelectors = { [Selector in `&${string}` | `>${string}` | `[${string}`]: GriffelStyle };

/**
 * Type for CSS At-Rules
 *
 * @example { "@media (min-width: 600px)": { color: "red" } }
 * @example { "@supports (display: grid)": { color: "red" } }
 */
type GriffelCSSAtQueries = {
  [Selector in `${'@media' | '@supports' | '@container' | '@layer'}${string}`]: GriffelStyle;
};

export type GriffelAnimation = Record<'from' | 'to' | string, GriffelCSSProperties & GriffelCSSCustomProperties>;
export type GriffelStyle = GriffelCSSProperties &
  GriffelCSSCustomProperties &
  GriffelCSSPseudoSelectors &
  GriffelCSSAmpersandSelectors &
  GriffelCSSAtQueries;
