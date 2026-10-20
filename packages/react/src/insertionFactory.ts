'use client';

import type { CSSRulesByBucket, GriffelInsertionFactory, GriffelRenderer } from '@griffel/core';

import { canUseDOM } from './utils/canUseDOM.js';
import { useInsertionEffect } from './useInsertionEffect.js';

export const insertionFactory: GriffelInsertionFactory = () => {
  const insertionCache: Record<string, boolean> = {};
  // Rule sets already inserted from an insertion effect, per renderer. Every mount of a component runs
  // its effect again with the same rules, and re-inserting walks every rule only to find it in the
  // renderer's own cache.
  const insertedRules = new WeakMap<CSSRulesByBucket, Record<string, boolean>>();

  return function insert(renderer: GriffelRenderer, cssRules: CSSRulesByBucket) {
    // Even if `useInsertionEffect` is available, we can use it on a client only as it will not be executed in SSR
    if (useInsertionEffect && canUseDOM()) {
      // eslint-disable-next-line react-x/rules-of-hooks
      useInsertionEffect(() => {
        let renderers = insertedRules.get(cssRules);

        if (renderers?.[renderer.id]) {
          return;
        }

        renderer.insertCSSRules(cssRules!);

        if (!renderers) {
          renderers = {};
          insertedRules.set(cssRules, renderers);
        }
        renderers[renderer.id] = true;
      }, [renderer, cssRules]);

      return;
    }

    if (insertionCache[renderer.id] === undefined) {
      renderer.insertCSSRules(cssRules!);
      insertionCache[renderer.id] = true;
    }
  };
};
