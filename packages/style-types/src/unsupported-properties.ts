/**
 * Griffel doesn't support *some* of CSS shorthands, they are listed below.
 *
 * They can be replaced either with the corresponding longhand properties or with the `shorthands` helper functions.
 *
 * @see https://github.com/microsoft/griffel/issues/531
 * @see https://griffel.js.org/react/guides/limitations#css-shorthands-are-not-supported
 */
export interface GriffelStylesUnsupportedCSSProperties {
  /** @deprecated */
  all: never;

  /** @deprecated Use `shorthands.borderColor()` instead. */
  borderColor: never;
  /** @deprecated Use `shorthands.borderStyle()` instead. */
  borderStyle: never;
  /** @deprecated Use `shorthands.borderWidth()` instead. */
  borderWidth: never;

  /** @deprecated Use corresponding longhand properties such as `borderBlockStartColor` and `borderBlockEndStyle` instead. */
  borderBlock: never;
  /** @deprecated Use corresponding longhand properties such as `borderBlockEndColor` and `borderBlockEndStyle` instead. */
  borderBlockEnd: never;
  /** @deprecated Use corresponding longhand properties such as `borderBlockStartColor` and `borderBlockStartStyle` instead. */
  borderBlockStart: never;
  /** @deprecated Use corresponding longhand properties such as `borderInlineStartColor` and `borderInlineEndStyle` instead. */
  borderInline: never;
  /** @deprecated Use corresponding longhand properties such as `borderInlineEndColor` and `borderInlineEndStyle` instead. */
  borderInlineEnd: never;
  /** @deprecated Use corresponding longhand properties such as `borderInlineStartColor` and `borderInlineStartStyle` instead. */
  borderInlineStart: never;
}
