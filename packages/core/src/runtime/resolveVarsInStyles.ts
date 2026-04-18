import hashString from '@emotion/hash';
import { GRIFFEL_VAR_PLACEHOLDER_PREFIX, GRIFFEL_VAR_PLACEHOLDER_REGEX, VAR_HASH_PREFIX } from '../constants.js';
import { __internal_getResolvedName, __internal_resolvePlaceholder } from '../createVar.js';
import { isObject } from './utils/isObject.js';

/**
 * Walks a styles block and rewrites any placeholder tokens in keys and values
 * to stable `--fv-<blockHash>-<index>` names. Returns the input unchanged
 * (same reference) if no placeholders are found.
 *
 * The returned object is safe to mutate; the input is never mutated.
 */
export function resolveVarsInStyles<T extends object>(styles: T, classNameHashSalt: string): T {
  // Cheap pre-check: skip the walk entirely if the serialized block doesn't
  // mention our prefix. Avoids the global-regex `lastIndex` footgun of `.test()`
  // by using `.includes()` on a one-shot stringification.
  if (!containsPlaceholder(styles)) {
    return styles;
  }

  const placeholders = collectPlaceholders(styles);
  if (placeholders.size === 0) {
    return styles;
  }

  // Hash the block contents + salt. Because placeholders are deterministic
  // across server and client (same module load order → same counter values),
  // stringified content matches and so does the hash.
  const blockHash = hashString(classNameHashSalt + stableStringify(styles));

  // Assign final names in placeholder-appearance order (Set preserves insertion order).
  const remap = new Map<string, string>();
  let index = 0;
  for (const placeholder of placeholders) {
    const existing = __internal_getResolvedName(placeholder);
    if (existing !== undefined) {
      remap.set(placeholder, existing);
    } else {
      const finalName = `--${VAR_HASH_PREFIX}-${blockHash}-${index}`;
      __internal_resolvePlaceholder(placeholder, finalName);
      remap.set(placeholder, finalName);
    }
    index += 1;
  }

  return rewriteStyles(styles, remap);
}

function containsPlaceholder(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.includes(GRIFFEL_VAR_PLACEHOLDER_PREFIX);
  }
  if (Array.isArray(value)) {
    return value.some(containsPlaceholder);
  }
  if (isObject(value)) {
    for (const k of Object.keys(value as object)) {
      if (k.includes(GRIFFEL_VAR_PLACEHOLDER_PREFIX)) return true;
      if (containsPlaceholder((value as Record<string, unknown>)[k])) return true;
    }
  }
  return false;
}

function collectPlaceholders(styles: object, acc: Set<string> = new Set()): Set<string> {
  for (const key of Object.keys(styles)) {
    for (const match of key.matchAll(GRIFFEL_VAR_PLACEHOLDER_REGEX)) {
      acc.add(match[0]);
    }
    const value = (styles as Record<string, unknown>)[key];
    collectFromValue(value, acc);
  }
  return acc;
}

function collectFromValue(value: unknown, acc: Set<string>): void {
  if (typeof value === 'string') {
    for (const match of value.matchAll(GRIFFEL_VAR_PLACEHOLDER_REGEX)) {
      acc.add(match[0]);
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectFromValue(item, acc);
  } else if (isObject(value)) {
    collectPlaceholders(value as object, acc);
  }
}

function rewriteStyles<T extends object>(styles: T, remap: Map<string, string>): T {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(styles)) {
    const rewrittenKey = rewriteString(key, remap);
    out[rewrittenKey] = rewriteValue((styles as Record<string, unknown>)[key], remap);
  }
  return out as T;
}

function rewriteValue(value: unknown, remap: Map<string, string>): unknown {
  if (typeof value === 'string') return rewriteString(value, remap);
  if (Array.isArray(value)) return value.map(item => rewriteValue(item, remap));
  if (isObject(value)) return rewriteStyles(value as object, remap);
  return value;
}

function rewriteString(input: string, remap: Map<string, string>): string {
  if (!input.includes(GRIFFEL_VAR_PLACEHOLDER_PREFIX)) {
    return input;
  }
  return input.replace(GRIFFEL_VAR_PLACEHOLDER_REGEX, match => remap.get(match) ?? match);
}

/** JSON.stringify honors insertion order, which matches between server and client for the same source module. */
function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}
