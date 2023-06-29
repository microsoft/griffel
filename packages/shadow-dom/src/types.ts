import type { GriffelRenderer, StyleBucketName } from '@griffel/core';

export type ExtendedCSSStyleSheet = CSSStyleSheet & {
  bucketName: StyleBucketName;
  metadata: Record<string, unknown>;
};
export type GriffelShadowDOMRenderer = GriffelRenderer & {
  adoptedStyleSheets: ExtendedCSSStyleSheet[];
};
