import {
  getStyleSheetKey,
  insertRuleInCascadeLayer,
  normalizeCSSBucketEntry,
  resolveCascadeLayer,
  safeInsertRule,
} from '@griffel/core';
import type { GriffelCascadeLayerFn, GriffelRenderer, StyleBucketName } from '@griffel/core';

import { createFallbackRenderer } from './createFallbackRenderer.js';
import { findInsertionPoint, findShadowRootInsertionPoint } from './findInsertionPoint.js';
import type { ExtendedCSSStyleSheet, GriffelShadowDOMRenderer } from './types.js';

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

  /**
   * Puts rules of every style bucket into a cascade layer, see `CreateDOMRendererOptions.cascadeLayer` in
   * `@griffel/core`.
   */
  cascadeLayer?: GriffelCascadeLayerFn;
}

let rendererId = 0;

// A lexicographic comparator, used as the default for ordering both "@media" and "@container"
// query conditions.
const compareQueriesLexicographically = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

function getCSSStyleSheetForBucket(
  cssSheetsCache: Record<string, ExtendedCSSStyleSheet>,

  bucketName: StyleBucketName,
  metadata: Record<string, unknown> = {},
  cascadeLayer: GriffelCascadeLayerFn | undefined,

  onStyleSheetInsert: (stylesheet: ExtendedCSSStyleSheet) => void,
): ExtendedCSSStyleSheet {
  const styleSheetKey = getStyleSheetKey(
    bucketName,
    (metadata['x'] as string | undefined) ?? (metadata['m'] as string | undefined) ?? '',
    (metadata['p'] as number | undefined) ?? 0,
  );

  if (!cssSheetsCache[styleSheetKey]) {
    const styleSheet = new CSSStyleSheet() as ExtendedCSSStyleSheet;

    styleSheet.bucketName = bucketName;
    styleSheet.metadata = metadata;
    styleSheet.layer = resolveCascadeLayer(cascadeLayer, bucketName, metadata);

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
    return createFallbackRenderer(shadowRoot, options.cascadeLayer) as GriffelRenderer & {
      adoptedStyleSheets?: never;
    };
  }

  const { insertionPoint, cascadeLayer } = options;

  const cssSheetsCache: Record<string, ExtendedCSSStyleSheet> = {};
  const renderer: GriffelShadowDOMRenderer = {
    id: `shadow-dom:${rendererId++}`,

    adoptedStyleSheets: [],
    insertionCache: {},
    stylesheets: {},

    compareMediaQueries: compareQueriesLexicographically,
    // Container queries reuse the same comparator as media queries.
    compareContainerQueries: compareQueriesLexicographically,
    ...(cascadeLayer && { cascadeLayer }),
    insertCSSRules(cssRules) {
      for (const [_styleBucketName, cssBucketEntries] of Object.entries(cssRules)) {
        const styleBucketName = _styleBucketName as StyleBucketName;

        for (let i = 0, l = cssBucketEntries.length; i < l; i++) {
          const [ruleCSS, metadata] = normalizeCSSBucketEntry(cssBucketEntries[i]);
          const sheet = getCSSStyleSheetForBucket(
            cssSheetsCache,

            styleBucketName,
            metadata,
            cascadeLayer,

            styleSheet => {
              const targetStyleSheet = findInsertionPoint(renderer, styleSheet);
              const shadowRootTargetSheet = findShadowRootInsertionPoint(shadowRoot, targetStyleSheet, insertionPoint);

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

          if (sheet.layer) {
            const layer = sheet.layer;
            safeInsertRule({ insertRule: rule => insertRuleInCascadeLayer(sheet, layer, rule) }, ruleCSS);
          } else {
            safeInsertRule(sheet, ruleCSS);
          }
        }
      }
    },
  };

  return renderer;
}
