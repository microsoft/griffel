import type * as CSS from 'csstype';
import type { GriffelStylesCSSValue } from './shared';

//
// Types for makeResetStyles()
// ---
//

type GriffelResetCSSProperties = Omit<
  CSS.PropertiesFallback<GriffelStylesCSSValue>,
  // We have custom definition for "animationName"
  'animationName'
> & { animationName?: GriffelResetAnimation | GriffelResetAnimation[] | string };

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
type GriffelCSSPseudoSelectors = {
  [Selector in CSS.Pseudos | `${CSS.Pseudos | ':global'}${string}`]?: GriffelResetStyle;
};

/**
 * Type for CSS "&" selectors
 *
 * @example { "&.foo": { color: "red" } }
 * @example { "> div": { color: "red" } }
 * @example { "[data-attr]": { color: "red" } }
 * @example { "&.foo > div": { color: "red" } }
 * @example { "&.foo": { "&.bar": { color: "red" } } }
 */
type GriffelCSSAmpersandSelectors = { [Selector in `&${string}` | `>${string}` | `[${string}`]: GriffelResetStyle };

/**
 * Type for CSS At-Rules
 *
 * @example { "@media (min-width: 600px)": { color: "red" } }
 * @example { "@supports (display: grid)": { color: "red" } }
 */
type GriffelCSSAtQueries = {
  [Selector in `${'@media' | '@supports' | '@container' | '@layer'}${string}`]: GriffelResetStyle;
};

export type GriffelResetAnimation = Record<
  'from' | 'to' | string,
  GriffelResetCSSProperties & GriffelCSSCustomProperties
>;
export type GriffelResetStyle = GriffelResetCSSProperties &
  GriffelCSSCustomProperties &
  GriffelCSSPseudoSelectors &
  GriffelCSSAmpersandSelectors &
  GriffelCSSAtQueries;
