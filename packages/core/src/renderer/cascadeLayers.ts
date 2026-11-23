import type { CSSBucketEntryMetadata, GriffelCascadeLayerFn, StyleBucketName } from '../types.js';

/**
 * Returns `true` for rules that already name their own cascade layer (`@layer foo { ... }` or `@layer foo, bar;`).
 *
 * Such rules come from styles that use `@layer` explicitly (e.g. `makeStyles({ root: { '@layer foo': {} } })`).
 * They are never wrapped into the layer returned by `cascadeLayer`: the author already chose a layer, and wrapping
 * would silently turn `foo` into a nested `<layer>.foo` sublayer.
 *
 * @internal
 */
export function isLayeredCSSRule(cssRule: string): boolean {
  return cssRule.charCodeAt(0) === 64 /* @ */ && cssRule.slice(0, 7) === '@layer ';
}

/**
 * Wraps CSS text into a cascade layer block, mirroring stylis' minified output so the result can be parsed back
 * with the same tokens (see `unwrapCascadeLayer()`).
 *
 * @internal
 */
export function wrapInCascadeLayer(layerName: string, cssText: string): string {
  return '@layer ' + layerName + '{' + cssText + '}';
}

/**
 * Returns the CSS text inside `@layer <layerName>{...}` or `undefined` if the rule is not a block for that layer.
 *
 * @internal
 */
export function unwrapCascadeLayer(layerName: string, cssRule: string): string | undefined {
  const prefix = '@layer ' + layerName + '{';

  if (cssRule.slice(0, prefix.length) === prefix && cssRule.charCodeAt(cssRule.length - 1) === 125 /* } */) {
    return cssRule.slice(prefix.length, -1);
  }

  return undefined;
}

/**
 * Builds the metadata a `cascadeLayer` callback receives for a style sheet. Only the fields that identify a style
 * sheet (see `getStyleSheetKey()`) are passed, so a layer is a property of a style sheet, not of a single rule.
 *
 * @internal
 */
export function getCascadeLayerMetadata(
  bucketName: StyleBucketName,
  metadata: Record<string, unknown> | undefined,
): CSSBucketEntryMetadata {
  const result: CSSBucketEntryMetadata = {};

  if (metadata) {
    const priority = metadata['p'] as number | undefined;

    if (priority) {
      result.p = priority;
    }

    if (bucketName === 'm' && metadata['m'] !== undefined) {
      result.m = metadata['m'] as string;
    }

    if (bucketName === 'x' && metadata['x'] !== undefined) {
      result.x = metadata['x'] as string;
    }
  }

  return result;
}

/**
 * `CSSLayerBlockRule` per style sheet: rules are inserted into one `@layer <name> { ... }` block per sheet instead of
 * wrapping every rule. It keeps the CSSOM small and DevTools readable.
 */
const layerBlockCache = /*#__PURE__*/ new WeakMap<CSSStyleSheet, CSSGroupingRule>();

function isLayerBlock(rule: CSSRule | undefined, layerName: string): rule is CSSGroupingRule {
  return (
    !!rule &&
    typeof (rule as CSSGroupingRule).insertRule === 'function' &&
    (rule as CSSRule & { name?: string }).name === layerName
  );
}

function getLayerBlock(sheet: CSSStyleSheet, layerName: string): CSSGroupingRule | null {
  const cachedBlock = layerBlockCache.get(sheet);

  if (cachedBlock && cachedBlock.parentStyleSheet === sheet && isLayerBlock(cachedBlock, layerName)) {
    return cachedBlock;
  }

  // 👇 a block may already exist, e.g. it was server-rendered and the sheet was rehydrated
  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    const rule = sheet.cssRules[i];

    if (isLayerBlock(rule, layerName)) {
      layerBlockCache.set(sheet, rule);
      return rule;
    }
  }

  const index = sheet.insertRule(wrapInCascadeLayer(layerName, ''), sheet.cssRules.length);
  const rule = sheet.cssRules[index];

  if (isLayerBlock(rule, layerName)) {
    layerBlockCache.set(sheet, rule);
    return rule;
  }

  // 👇 the CSSOM implementation has no CSSLayerBlockRule (e.g. jsdom), each rule will be wrapped instead
  sheet.deleteRule(index);
  return null;
}

/**
 * Inserts a CSS rule into a cascade layer of a style sheet. Throws in the same cases as `CSSStyleSheet.insertRule()`.
 *
 * @internal
 */
export function insertRuleInCascadeLayer(sheet: CSSStyleSheet, layerName: string, cssRule: string): number {
  if (isLayeredCSSRule(cssRule)) {
    return sheet.insertRule(cssRule, sheet.cssRules.length);
  }

  const layerBlock = getLayerBlock(sheet, layerName);

  if (layerBlock) {
    return layerBlock.insertRule(cssRule, layerBlock.cssRules.length);
  }

  return sheet.insertRule(wrapInCascadeLayer(layerName, cssRule), sheet.cssRules.length);
}

/**
 * Splits CSS rules of a style sheet into a layered CSS text: rules are wrapped into a single `@layer` block, rules
 * that already name a layer are kept as is after it.
 *
 * @internal
 */
export function serializeRulesInCascadeLayer(layerName: string, cssRules: string[]): string[] {
  let layeredCSS = '';
  const result: string[] = [];

  for (let i = 0, l = cssRules.length; i < l; i++) {
    if (isLayeredCSSRule(cssRules[i])) {
      result.push(cssRules[i]);
    } else {
      layeredCSS += cssRules[i];
    }
  }

  if (layeredCSS.length > 0) {
    result.unshift(wrapInCascadeLayer(layerName, layeredCSS));
  }

  return result;
}

/** @internal */
export function resolveCascadeLayer(
  cascadeLayer: GriffelCascadeLayerFn | undefined,
  bucketName: StyleBucketName,
  metadata: Record<string, unknown> | undefined,
): string | undefined {
  if (!cascadeLayer) {
    return undefined;
  }

  return cascadeLayer(bucketName, getCascadeLayerMetadata(bucketName, metadata)) || undefined;
}
