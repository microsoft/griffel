// This should be just "export * as shorthands from "
// https://github.com/microsoft/fluentui/issues/20694
import {
  border,
  borderLeft,
  borderBottom,
  borderRight,
  borderTop,
  borderColor,
  borderStyle,
  borderRadius,
  borderWidth,
  flex,
  gap,
  gridArea,
  margin,
  marginBlock,
  marginInline,
  padding,
  paddingBlock,
  paddingInline,
  overflow,
  inset,
  outline,
  transition,
  textDecoration,
} from './shorthands/index.js';

export const shorthands = {
  border,
  borderLeft,
  borderBottom,
  borderRight,
  borderTop,
  borderColor,
  borderStyle,
  borderRadius,
  borderWidth,
  flex,
  gap,
  gridArea,
  margin,
  marginBlock,
  marginInline,
  padding,
  paddingBlock,
  paddingInline,
  overflow,
  inset,
  outline,
  transition,
  textDecoration,
};

export { createDOMRenderer } from './renderer/createDOMRenderer.js';
export type { CreateDOMRendererOptions } from './renderer/createDOMRenderer.js';
export { rehydrateRendererCache } from './renderer/rehydrateRendererCache.js';
export { safeInsertRule } from './renderer/safeInsertRule.js';

export { mergeClasses } from './mergeClasses.js';
export { makeStyles } from './makeStyles.js';
export type { MakeStylesOptions } from './makeStyles.js';
export { makeStaticStyles } from './makeStaticStyles.js';
export type { MakeStaticStylesOptions } from './makeStaticStyles.js';
export { makeResetStyles } from './makeResetStyles.js';

export { resolveStyleRulesForSlots } from './resolveStyleRulesForSlots.js';

// Private exports, are used by build time transforms or other tools
export { __css } from './__css.js';
export { __styles } from './__styles.js';
export { __resetCSS } from './__resetCSS.js';
export { __resetStyles } from './__resetStyles.js';
export { __staticCSS } from './__staticCSS.js';
export { __staticStyles } from './__staticStyles.js';

export { normalizeCSSBucketEntry } from './runtime/utils/normalizeCSSBucketEntry.js';
export { styleBucketOrdering, getStyleSheetKey } from './renderer/getStyleSheetForBucket.js';
export { defaultCompareMediaQueries } from './renderer/createDOMRenderer.js';
export { getStyleBucketName } from './runtime/getStyleBucketName.js';
export type { BucketStrategy } from './runtime/getStyleBucketName.js';
export { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots.js';
export { resolveStyleRules } from './runtime/resolveStyleRules.js';
export { resolveResetStyleRules } from './runtime/resolveResetStyleRules.js';
export { resolveStaticStyleRules } from './runtime/resolveStaticStyleRules.js';

export * from './constants.js';

export type {
  // Static styles
  GriffelStaticStyle,
  GriffelStaticStyles,
  // Styles
  GriffelAnimation,
  GriffelStyle,
  // Reset styles
  GriffelResetStyle,
  // Internal types
} from '@griffel/style-types';

export type {
  CSSClasses,
  CSSClassesMapBySlot,
  CSSBucketEntry,
  CSSRulesByBucket,
  StyleBucketName,
  // Util
  GriffelRenderer,
  GriffelInsertionFactory,
} from './types.js';

// Private exports, are used by devtools
export type { DebugCSSRules, DebugSequence, DebugResult } from './devtools/index.js';
