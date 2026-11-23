'use client';

import type { CSSRulesByBucket, GriffelInsertionFactory, GriffelRenderer } from '@griffel/core';

import { canUseDOM } from './utils/canUseDOM.js';
import { useInsertionEffect } from './useInsertionEffect.js';

export const insertionFactory: GriffelInsertionFactory = () => {
  // Keyed by renderer instance (not by `renderer.id`) so that entries are released together with renderers, e.g. when
  // a new renderer is created for every SSR request.
  const insertionCache = new WeakSet<GriffelRenderer>();

  return function insert(renderer: GriffelRenderer, cssRules: CSSRulesByBucket) {
    // Even if `useInsertionEffect` is available, we can use it on a client only as it will not be executed in SSR
    if (useInsertionEffect && canUseDOM()) {
      // eslint-disable-next-line react-x/rules-of-hooks
      useInsertionEffect(() => {
        renderer.insertCSSRules(cssRules!);
      }, [renderer, cssRules]);

      return;
    }

    if (!insertionCache.has(renderer)) {
      renderer.insertCSSRules(cssRules!);
      insertionCache.add(renderer);
    }
  };
};
