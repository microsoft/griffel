'use client';

import { createDOMRenderer, rehydrateRendererCache } from '@griffel/core';
import type { GriffelRenderer } from '@griffel/core';
import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react';

import { canUseDOM } from './utils/canUseDOM.js';

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
  children: ReactNode;
}

/**
 * @private
 */
const RendererContext = /*#__PURE__*/ createContext<GriffelRenderer>(/*#__PURE__*/ createDOMRenderer());

/**
 * @public
 */
export const RendererProvider: FC<RendererProviderProps> = ({ children, renderer, targetDocument }) => {
  // "rehydrateCache()" can't be called in effects as it needs to be called before any component will be rendered to
  // avoid double insertion of classes — useMemo runs synchronously before render, useEffect would be too late.
  // eslint-disable-next-line react-hooks/void-use-memo
  useMemo(() => {
    if (canUseDOM()) {
      rehydrateRendererCache(renderer, targetDocument);
    }
  }, [renderer, targetDocument]);

  return <RendererContext.Provider value={renderer}>{children}</RendererContext.Provider>;
};

/**
 * Returns an instance of current makeStyles() renderer.
 *
 * @private Exported as "useRenderer_unstable" use it on own risk. Can be changed or removed without a notice.
 */
export function useRenderer(): GriffelRenderer {
  return useContext(RendererContext);
}
