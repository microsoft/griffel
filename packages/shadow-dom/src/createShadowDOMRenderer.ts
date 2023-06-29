import { normalizeCSSBucketEntry, safeInsertRule } from '@griffel/core';
import type { GriffelRenderer, StyleBucketName } from '@griffel/core';

import { createFallbackRenderer } from './createFallbackRenderer';
import { ExtendedCSSStyleSheet, GriffelShadowDOMRenderer } from './types';
import { findInsertionPoint } from './findInsertionPoint';

const SUPPORTS_CONSTRUCTABLE_STYLESHEETS: boolean = (() => {
  try {
    new CSSStyleSheet();
    return true;
  } catch {
    return false;
  }
})();

let rendererId = 0;

function getCSSStyleSheetForBucket(
  cssSheetsCache: Record<string, ExtendedCSSStyleSheet>,

  bucketName: StyleBucketName,
  metadata: Record<string, unknown> = {},

  onStyleSheetInsert: (stylesheet: ExtendedCSSStyleSheet) => void,
): ExtendedCSSStyleSheet {
  const isMediaBucket = bucketName === 'm';
  const styleSheetKey: StyleBucketName | string = isMediaBucket ? ((bucketName + metadata['m']) as string) : bucketName;

  if (!cssSheetsCache[styleSheetKey]) {
    const styleSheet = new CSSStyleSheet() as ExtendedCSSStyleSheet;

    styleSheet.bucketName = bucketName;
    styleSheet.metadata = metadata;

    cssSheetsCache[styleSheetKey] = styleSheet;
    onStyleSheetInsert(styleSheet);
  }

  return cssSheetsCache[styleSheetKey];
}

function insertAfter<T extends CSSStyleSheet | ExtendedCSSStyleSheet>(
  arr: T[],
  sheetToInsert: T,
  targetSheet: T | null,
): T[] {
  if (targetSheet === null) {
    return [sheetToInsert, ...arr];
  }

  const index = arr.indexOf(targetSheet);

  return [...arr.slice(0, index + 1), sheetToInsert, ...arr.slice(index + 1)];
}

export function createShadowDOMRenderer(shadowRoot: ShadowRoot) {
  if (!SUPPORTS_CONSTRUCTABLE_STYLESHEETS) {
    return createFallbackRenderer(shadowRoot) as GriffelRenderer & {
      adoptedStyleSheets?: never;
    };
  }

  const cssSheetsCache: Record<string, ExtendedCSSStyleSheet> = {};
  const renderer: GriffelShadowDOMRenderer = {
    id: `shadow-dom:${rendererId++}`,

    adoptedStyleSheets: [],
    insertionCache: {},
    stylesheets: {},

    compareMediaQueries: (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0),
    insertCSSRules(cssRules) {
      for (const [_styleBucketName, cssBucketEntries] of Object.entries(cssRules)) {
        const styleBucketName = _styleBucketName as StyleBucketName;

        for (let i = 0, l = cssBucketEntries.length; i < l; i++) {
          const [ruleCSS, metadata] = normalizeCSSBucketEntry(cssBucketEntries[i]);
          const sheet = getCSSStyleSheetForBucket(
            cssSheetsCache,

            styleBucketName,
            metadata,

            styleSheet => {
              const targetStyleSheet = findInsertionPoint(renderer, styleSheet);

              renderer.adoptedStyleSheets = insertAfter(renderer.adoptedStyleSheets, styleSheet, targetStyleSheet);
              shadowRoot.adoptedStyleSheets = insertAfter(shadowRoot.adoptedStyleSheets, styleSheet, targetStyleSheet);
            },
          );

          if (renderer.insertionCache[ruleCSS]) {
            continue;
          }

          renderer.insertionCache[ruleCSS] = styleBucketName;
          safeInsertRule(sheet, ruleCSS);
        }
      }
    },
  };

  return renderer;
}
