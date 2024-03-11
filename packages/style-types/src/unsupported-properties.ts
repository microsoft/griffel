/**
 * @TODO update
 *
 * Griffel doesn't support expansion of CSS shorthands.
 * They can be replaced either with the corresponding longhand properties or with the `shorthands` helper functions.
 * @see https://griffel.js.org/react/guides/limitations#css-shorthands-are-not-supported
 */
export interface GriffelStylesUnsupportedCSSProperties {
  /** @deprecated */
  all: never;
}
