import type { CSSBucketEntryMetadata, StyleBucketName } from '../types.js';
import { styleBucketOrdering } from './getStyleSheetForBucket.js';

export interface GetCascadeLayerOrderOptions {
  /**
   * Priorities for which layers are requested from the callback, by default only `0` is used. Pass `[-1, 0]` if
   * the callback returns layers per priority (shorthands have priority `-1`).
   */
  priorities?: number[];
}

/**
 * Returns an `@layer` statement that declares layers returned by `cascadeLayer` in Griffel's bucket order (`r d l v w f
 * i h a s k t m c x`). A callback may return multiple layers per bucket, they are declared in the returned order:
 *
 * @example
 * ```ts
 * getCascadeLayerOrder(bucket => [`fluentui.${bucket}.components`, `fluentui.${bucket}.griffel`]);
 * // "@layer fluentui.r.components, fluentui.r.griffel, fluentui.d.components, fluentui.d.griffel, …;"
 * ```
 *
 * ⚠️ The statement should be the first CSS on a page: a layer's position is fixed where it first appears.
 *
 * @public
 */
export function getCascadeLayerOrder(
  cascadeLayer: (
    bucketName: StyleBucketName,
    metadata: CSSBucketEntryMetadata,
  ) => string | readonly string[] | undefined | null,
  options: GetCascadeLayerOrderOptions = {},
): string {
  const priorities = (options.priorities ?? [0]).slice().sort((a, b) => a - b);
  const layerNames = new Set<string>();

  for (const bucketName of styleBucketOrdering) {
    for (const priority of priorities) {
      const layers = cascadeLayer(bucketName, priority === 0 ? {} : { p: priority });

      if (!layers) {
        continue;
      }

      for (const layerName of typeof layers === 'string' ? [layers] : layers) {
        layerNames.add(layerName);
      }
    }
  }

  return layerNames.size > 0 ? '@layer ' + Array.from(layerNames).join(', ') + ';' : '';
}
