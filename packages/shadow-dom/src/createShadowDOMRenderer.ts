import { normalizeCSSBucketEntry, safeInsertRule } from '@griffel/core';
import type { GriffelRenderer, StyleBucketName } from '@griffel/core';

import { createFallbackRenderer } from './createFallbackRenderer';
import type { ExtendedCSSStyleSheet, GriffelShadowDOMRenderer } from './types';
import { findInsertionPoint, findShadowRootInsertionPoint } from './findInsertionPoint';

const SUPPORTS_CONSTRUCTABLE_STYLESHEETS: boolean = (() => {
  try {
    new CSSStyleSheet();
    return true;
  } catch {
    return false;
  }
})();

export interface CreateShadowDomRendererOptions {
  /**
   * If specified, a renderer will insert created CSSStyleSheets after this CSSStyleSheet.
   */
  insertionPoint?: CSSStyleSheet;
}

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

function insertBefore<T extends CSSStyleSheet | ExtendedCSSStyleSheet>(
  arr: T[],
  sheetToInsert: T,
  targetSheet: T | null,
): T[] {
  if (targetSheet === null) {
    return [...arr, sheetToInsert];
  }

  const index = arr.indexOf(targetSheet);

  return [...arr.slice(0, index), sheetToInsert, ...arr.slice(index)];
}

export function createShadowDOMRenderer(shadowRoot: ShadowRoot, options: CreateShadowDomRendererOptions = {}) {
  if (!SUPPORTS_CONSTRUCTABLE_STYLESHEETS) {
    return createFallbackRenderer(shadowRoot) as GriffelRenderer & {
      adoptedStyleSheets?: never;
    };
  }

  const { insertionPoint } = options;

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
              const shadowRootTargetSheet = findShadowRootInsertionPoint(
                renderer,
                shadowRoot,
                targetStyleSheet,
                insertionPoint,
              );

              renderer.adoptedStyleSheets = insertBefore(renderer.adoptedStyleSheets, styleSheet, targetStyleSheet);
              shadowRoot.adoptedStyleSheets = insertBefore(
                shadowRoot.adoptedStyleSheets,
                styleSheet,
                shadowRootTargetSheet,
              );
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
