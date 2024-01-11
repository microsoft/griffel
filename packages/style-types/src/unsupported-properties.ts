import type * as CSS from 'csstype';

/**
 * Griffel doesn't support expansion of CSS shorthands.
 * They can be replaced either with the corresponding longhand properties or with the `shorthands` helper functions.
 * @see https://griffel.js.org/react/guides/limitations#css-shorthands-are-not-supported
 */
export interface GriffelStylesUnsupportedCSSProperties extends Record<keyof CSS.StandardShorthandProperties, never> {
  /** @deprecated */
  all: never;
  /** @deprecated Use corresponding longhand properties such as `animationName` and `animationDuration` instead. */
  animation: never;
  /** @deprecated Use corresponding longhand properties such as `animationRangeStart` and `animationRangeEnd` instead. */
  animationRange: never;
  /** @deprecated Use corresponding longhand properties such as `backgroundImage` and `backgroundSize` instead. */
  background: never;
  /** @deprecated Use corresponding longhand properties `backgroundPositionX` and `backgroundPositionY` instead. */
  backgroundPosition: never;
  /** @deprecated Use `shorthands.border()` instead. */
  border: never;
  /** @deprecated Use corresponding longhand properties such as `borderBlockStartColor` and `borderBlockEndStyle` instead. */
  borderBlock: never;
  /** @deprecated Use corresponding longhand properties such as `borderBlockEndColor` and `borderBlockEndStyle` instead. */
  borderBlockEnd: never;
  /** @deprecated Use corresponding longhand properties such as `borderBlockStartColor` and `borderBlockStartStyle` instead. */
  borderBlockStart: never;
  /** @deprecated Use `shorthands.borderBottom()` instead. */
  borderBottom: never;
  /** @deprecated Use `shorthands.borderColor()` instead. */
  borderColor: never;
  /** @deprecated Use corresponding longhand properties such as `borderImageSource` and `borderImageWidth` instead. */
  borderImage: never;
  /** @deprecated Use corresponding longhand properties such as `borderInlineStartColor` and `borderInlineEndStyle` instead. */
  borderInline: never;
  /** @deprecated Use corresponding longhand properties such as `borderInlineEndColor` and `borderInlineEndStyle` instead. */
  borderInlineEnd: never;
  /** @deprecated Use corresponding longhand properties such as `borderInlineStartColor` and `borderInlineStartStyle` instead. */
  borderInlineStart: never;
  /** @deprecated Use `shorthands.borderLeft()` instead. */
  borderLeft: never;
  /** @deprecated Use `shorthands.borderRadius()` instead. */
  borderRadius: never;
  /** @deprecated Use `shorthands.borderRight()` instead. */
  borderRight: never;
  /** @deprecated Use `shorthands.borderStyle()` instead. */
  borderStyle: never;
  /** @deprecated Use `shorthands.borderTop()` instead. */
  borderTop: never;
  /** @deprecated Use `shorthands.borderWidth()` instead. */
  borderWidth: never;
  /** @deprecated Use corresponding longhand properties `caretColor` and `caretShape` instead. */
  caret: never;
  /** @deprecated Use corresponding longhand properties `columnCount` and `columnWidth` instead. */
  columns: never;
  /** @deprecated Use corresponding longhand properties such as `columnRuleWidth` and `columnRuleColor` instead. */
  columnRule: never;
  /** @deprecated Use corresponding longhand properties `containIntrinsicWidth` and `containIntrinsicHeight` instead. */
  containIntrinsicSize: never;
  /** @deprecated Use corresponding longhand properties `containerName` and `containerType` instead. */
  container: never;
  /** @deprecated Use `shorthands.flex()` instead. */
  flex: never;
  /** @deprecated Use corresponding longhand properties `flexWrap` and `flexDirection` instead. */
  flexFlow: never;
  /** @deprecated Use corresponding longhand properties such as `fontFamily` and `fontSize` instead. */
  font: never;
  /** @deprecated Use `shorthands.gap()` instead. */
  gap: never;
  /** @deprecated Use corresponding longhand properties such as `gridTemplateColumns` and `gridAutoRows` instead. */
  grid: never;
  /** @deprecated Use `shorthands.gridArea()` instead. */
  gridArea: never;
  /** @deprecated Use corresponding longhand properties `gridColumnStart` and `gridColumnEnd` instead. */
  gridColumn: never;
  /** @deprecated Use corresponding longhand properties `gridRowStart` and `gridRowEnd` instead. */
  gridRow: never;
  /** @deprecated Use corresponding longhand properties such as `gridTemplateColumns` and `gridTemplateRows` instead. */
  gridTemplate: never;
  /** @deprecated Use corresponding longhand properties `top`, `right`, `left` and `bottom` instead. */
  inset: never;
  /** @deprecated Use corresponding longhand properties such as `insetBlockStart` and `insetBlockEnd` instead. */
  insetBlock: never;
  /** @deprecated Use corresponding longhand properties such as `insetInlineStart` and `insetInlineEnd` instead. */
  insetInline: never;
  /** @deprecated */
  lineClamp: never;
  /** @deprecated Use corresponding longhand properties such as `listStyleType` instead. */
  listStyle: never;
  /** @deprecated Use `shorthands.margin()` instead. */
  margin: never;
  /** @deprecated Use `shorthands.marginBlock()` instead. */
  marginBlock: never;
  /** @deprecated Use `shorthands.marginInline()` instead. */
  marginInline: never;
  /** @deprecated Use corresponding longhand properties such as `maskImage` and `maskSize` instead. */
  mask: never;
  /** @deprecated Use corresponding longhand properties such as `maskBorderSource` and `maskBorderWidth` instead. */
  maskBorder: never;
  /** @deprecated */
  motion: never;
  /** @deprecated Use corresponding longhand properties such as `offsetPath` and `offsetDistance` instead. */
  offset: never;
  /** @deprecated Use corresponding longhand properties such as `outlineColor` and `outlineWidth` instead. */
  outline: never;
  /** @deprecated Use `shorthands.overflow()` instead. */
  overflow: never;
  /** @deprecated Use corresponding longhand properties `overscrollBehaviorX` and `overscrollBehaviorY` instead. */
  overscrollBehavior: never;
  /** @deprecated Use `shorthands.padding()` instead. */
  padding: never;
  /** @deprecated Use `shorthands.paddingBlock()` instead. */
  paddingBlock: never;
  /** @deprecated Use `shorthands.paddingInline()` instead. */
  paddingInline: never;
  /** @deprecated Use corresponding longhand properties `alignItems` and `justifyItems` instead. */
  placeItems: never;
  /** @deprecated Use corresponding longhand properties `alignContent` and `justifyContent` instead. */
  placeContent: never;
  /** @deprecated Use corresponding longhand properties `alignSelf` and `justifySelf` instead. */
  placeSelf: never;
  /** @deprecated */
  scrollMargin: never;
  /** @deprecated */
  scrollMarginBlock: never;
  /** @deprecated */
  scrollMarginInline: never;
  /** @deprecated */
  scrollPadding: never;
  /** @deprecated */
  scrollPaddingBlock: never;
  /** @deprecated */
  scrollPaddingInline: never;
  /** @deprecated */
  scrollSnapMargin: never;
  /** @deprecated */
  scrollTimeline: never;
  /** @deprecated Use corresponding longhand properties such as `textDecorationColor` and `textDecorationLine` instead. */
  textDecoration: never;
  /** @deprecated Use corresponding longhand properties `textEmphasisColor` and `textEmphasisStyle` instead. */
  textEmphasis: never;
  /** @deprecated Use `shorthands.transition()` instead. */
  transition: never;
  /** @deprecated Use corresponding longhand properties such as `viewTimelineName` and `viewTimelineAxis` instead. */
  viewTimeline: never;
}
