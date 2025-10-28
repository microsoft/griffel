'use client';

import * as React from 'react';

export interface TextDirectionProviderProps {
  /** Indicates the directionality of the element's text. */
  dir: 'ltr' | 'rtl';

  /**
   * Content wrapped by the TextDirectionProvider.
   */
  children: React.ReactNode;
}

/**
 * @private
 */
const TextDirectionContext = React.createContext<'ltr' | 'rtl'>('ltr');

/**
 * @public
 */
export const TextDirectionProvider: React.FC<TextDirectionProviderProps> = ({ children, dir }) => {
  return <TextDirectionContext.Provider value={dir}>{children}</TextDirectionContext.Provider>;
};

/**
 * Returns current directionality of the element's text.
 *
 * @private
 */
export function useTextDirection() {
  return React.useContext(TextDirectionContext);
}
