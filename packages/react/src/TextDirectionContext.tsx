'use client';

import { createContext, useContext, type FC, type ReactNode } from 'react';

export interface TextDirectionProviderProps {
  /** Indicates the directionality of the element's text. */
  dir: 'ltr' | 'rtl';

  /**
   * Content wrapped by the TextDirectionProvider.
   */
  children: ReactNode;
}

/**
 * @private
 */
const TextDirectionContext = /*#__PURE__*/ createContext<'ltr' | 'rtl'>('ltr');

/**
 * @public
 */
export const TextDirectionProvider: FC<TextDirectionProviderProps> = ({ children, dir }) => {
  return <TextDirectionContext.Provider value={dir}>{children}</TextDirectionContext.Provider>;
};

/**
 * Returns current directionality of the element's text.
 *
 * @private
 */
export function useTextDirection() {
  return useContext(TextDirectionContext);
}
