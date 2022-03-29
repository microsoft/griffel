import * as React from 'react';
import type { BrowserTheme } from './types';

export const ThemeContext = React.createContext<BrowserTheme>('light');

export function useThemeContext() {
  return React.useContext(ThemeContext);
}
