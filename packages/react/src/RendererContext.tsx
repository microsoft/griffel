import { createDOMRenderer, rehydrateRendererCache } from '@griffel/core';
import type { GriffelRenderer } from '@griffel/core';
import * as React from 'react';

import { canUseDOM } from './utils/canUseDOM';

export interface RendererProviderProps {
  /** An instance of Griffel renderer. */
  renderer: GriffelRenderer;

  /**
   * Document used to insert CSS variables to head
   */
  targetDocument?: Document;

  /**
   * Content wrapped by the RendererProvider
   */
  children: React.ReactNode;
}

/**
 * @private
 */
const RendererContext = React.createContext<GriffelRenderer>(createDOMRenderer());

/**
 * @public
 */
export const RendererProvider: React.FC<RendererProviderProps> = ({ children, renderer, targetDocument }) => {
  if (canUseDOM()) {
    // This if statement technically breaks the rules of hooks, but is safe because the condition never changes after
    // mounting.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useMemo(() => {
      // "rehydrateCache()" can't be called in effects as it needs to be called before any component will be rendered to
      // avoid double insertion of classes
      rehydrateRendererCache(renderer, targetDocument);
    }, [renderer, targetDocument]);
  }

  return <RendererContext.Provider value={renderer}>{children}</RendererContext.Provider>;
};

/**
 * Returns an instance of current makeStyles() renderer.
 *
 * @private Exported as "useRenderer_unstable" use it on own risk. Can be changed or removed without a notice.
 */
export function useRenderer(): GriffelRenderer {
  return React.useContext(RendererContext);
}
