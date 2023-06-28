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
} from './shorthands/index';

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

export { createDOMRenderer } from './renderer/createDOMRenderer';
export type { CreateDOMRendererOptions } from './renderer/createDOMRenderer';
export { rehydrateRendererCache } from './renderer/rehydrateRendererCache';

export { mergeClasses } from './mergeClasses';
export { makeStyles } from './makeStyles';
export { makeStaticStyles } from './makeStaticStyles';
export { makeResetStyles } from './makeResetStyles';

export { resolveStyleRulesForSlots } from './resolveStyleRulesForSlots';

// Private exports, are used by build time transforms or other tools
export { __css } from './__css';
export { __styles } from './__styles';
export { __resetCSS } from './__resetCSS';
export { __resetStyles } from './__resetStyles';

export { normalizeCSSBucketEntry } from './runtime/utils/normalizeCSSBucketEntry';
export { styleBucketOrdering } from './renderer/getStyleSheetForBucket';
export { defaultCompareMediaQueries } from './renderer/createDOMRenderer';
export { getStyleBucketName } from './runtime/getStyleBucketName';
export { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots';
export { resolveStyleRules } from './runtime/resolveStyleRules';
export { resolveResetStyleRules } from './runtime/resolveResetStyleRules';

export * from './constants';
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
  CSSClasses,
  CSSClassesMapBySlot,
  CSSBucketEntry,
  CSSRulesByBucket,
  StyleBucketName,
  // Util
  MakeStaticStylesOptions,
  MakeStylesOptions,
  GriffelRenderer,
} from './types';

// Private exports, are used by devtools
export type { DebugCSSRules, DebugSequence, DebugResult } from './devtools';
