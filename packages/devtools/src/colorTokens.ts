import type { ColorTokens } from './types';

export const LIGHT_THEME_COLOR_TOKENS: ColorTokens = {
  foreground: 'rgb(34, 34, 34)',
  background: 'white',

  cssAtRule: 'rgb(128, 134, 139)',
  cssProperty: 'rgb(19, 44, 121)',
  cssPunctuation: 'rgb(102, 102, 102)',
  cssSelector: 'rgb(158, 51, 121)',

  slotNameBackground: 'rgb(247, 247, 247)',
  slotNameBorder: 'rgb(202, 205, 209)',
};

export const DARK_THEME_COLOR_TOKENS: ColorTokens = {
  ...LIGHT_THEME_COLOR_TOKENS,
  background: 'rgb(32, 33, 36)',
  foreground: 'rgb(213, 213, 213)',

  cssAtRule: 'rgb(128, 134, 139)',
  cssProperty: 'rgb(156, 220, 254)',
  cssPunctuation: 'rgb(167, 167, 167)',
  cssSelector: 'rgb(175, 165, 143)',

  slotNameBackground: 'rgb(51, 51, 51)',
  slotNameBorder: 'rgb(73, 76, 80)',
};
