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
  margin,
  padding,
  overflow,
  inset,
  outline,
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
  margin,
  padding,
  overflow,
  inset,
  outline,
};

export { createDOMRenderer } from './renderer/createDOMRenderer';
export type { CreateDOMRendererOptions } from './renderer/createDOMRenderer';
export { styleBucketOrdering } from './renderer/getStyleSheetForBucket';
export { rehydrateRendererCache } from './renderer/rehydrateRendererCache';

export { mergeClasses } from './mergeClasses';
export { makeStaticStyles } from './makeStaticStyles';
export { makeStyles } from './makeStyles';
export { resolveStyleRulesForSlots } from './resolveStyleRulesForSlots';

// Private exports, are used by build time transforms
export { __css } from './__css';
export { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots';
export { resolveStyleRules } from './runtime/resolveStyleRules';
export { __styles } from './__styles';

export * from './constants';
export type {
  // Static styles
  GriffelStaticStyle,
  GriffelStaticStyles,
  // Styles
  GriffelAnimation,
  GriffelStyle,
  // Internal types
  CSSClasses,
  CSSClassesMapBySlot,
  CSSRulesByBucket,
  StyleBucketName,
  // Util
  MakeStaticStylesOptions,
  MakeStylesOptions,
  GriffelRenderer,
} from './types';

// Private exports, are used by devtools
export type { DebugCSSRules, DebugSequence, DebugResult } from './devtools';
