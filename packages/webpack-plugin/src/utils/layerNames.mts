import hashString from '@emotion/hash';
import type { StyleBucketName } from '@griffel/core';

export const GRIFFEL_LAYER_NAMESPACE = 'griffel';

const MEDIA_PLACEHOLDER_PREFIX = '__griffelmq_';
const CONTAINER_PLACEHOLDER_PREFIX = '__griffelcq_';
const PLACEHOLDER_SUFFIX = '__';
const HASH_LENGTH = 8;

export function hashOfQuery(query: string): string {
  return hashString(query).slice(0, HASH_LENGTH);
}

export function bucketLayerName(bucket: StyleBucketName, priority?: number): string {
  if (priority !== undefined && priority !== 0) {
    return `${GRIFFEL_LAYER_NAMESPACE}.${bucket}.s${priority}`;
  }
  return `${GRIFFEL_LAYER_NAMESPACE}.${bucket}`;
}

export function mediaPlaceholder(query: string): string {
  return `${GRIFFEL_LAYER_NAMESPACE}.m.${MEDIA_PLACEHOLDER_PREFIX}${hashOfQuery(query)}${PLACEHOLDER_SUFFIX}`;
}

export function containerPlaceholder(query: string): string {
  return `${GRIFFEL_LAYER_NAMESPACE}.c.${CONTAINER_PLACEHOLDER_PREFIX}${hashOfQuery(query)}${PLACEHOLDER_SUFFIX}`;
}

/**
 * Regex used by the asset-time pass to find and replace placeholders.
 * Captures the hash so callers can map it to its q<N> index.
 */
export const MEDIA_PLACEHOLDER_RE =
  /__griffelmq_([a-z0-9]+)__/g;
export const CONTAINER_PLACEHOLDER_RE =
  /__griffelcq_([a-z0-9]+)__/g;
