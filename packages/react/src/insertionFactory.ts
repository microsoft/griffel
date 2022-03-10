import type { CSSRulesByBucket, GriffelInsertionFactory, GriffelRenderer } from '@griffel/core';

import { canUseDOM } from './utils/canUseDOM';
import { useInsertionEffect } from './useInsertionEffect';

export const insertionFactory: GriffelInsertionFactory = () => {
  const insertionCache: Record<string, boolean> = {};

  return function insert(renderer: GriffelRenderer, cssRules: CSSRulesByBucket) {
    if (useInsertionEffect) {
      // Even if `useInsertionEffect` is available, we can't use it in SSR as it will not be executed
      if (canUseDOM()) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useInsertionEffect(() => {
          renderer.insertCSSRules(cssRules!);
        }, [renderer, cssRules]);

        return;
      }
    }

    if (insertionCache[renderer.id] === undefined) {
      renderer.insertCSSRules(cssRules!);
      insertionCache[renderer.id] = true;
    }
  };
};
