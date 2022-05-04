import type { ColorTokens } from './types';

export const tokens: Record<keyof ColorTokens, `var(--griffel-${keyof ColorTokens})`> = {
  foreground: 'var(--griffel-foreground)',
  background: 'var(--griffel-background)',

  cssAtRule: 'var(--griffel-cssAtRule)',
  cssNumber: 'var(--griffel-cssNumber)',
  cssProperty: 'var(--griffel-cssProperty)',
  cssPunctuation: 'var(--griffel-cssPunctuation)',
  cssSelector: 'var(--griffel-cssSelector)',

  slotNameBackground: 'var(--griffel-slotNameBackground)',
  slotNameBorder: 'var(--griffel-slotNameBorder)',

  tooltipBackground: 'var(--griffel-tooltipBackground)',
};

function themeToVariables(theme: ColorTokens) {
  return Object.fromEntries(
    Object.entries(theme).map(([token, value]) => {
      return [`--griffel-${token}`, value];
    }),
  );
}

export const lightTheme = themeToVariables({
  foreground: 'rgb(34, 34, 34)',
  background: 'white',

  cssAtRule: 'rgb(128, 134, 139)',
  cssNumber: 'rgb(9, 134, 88)',
  cssProperty: 'rgb(19, 44, 121)',
  cssPunctuation: 'rgb(102, 102, 102)',
  cssSelector: 'rgb(158, 51, 121)',

  slotNameBackground: 'rgb(247, 247, 247)',
  slotNameBorder: 'rgb(202, 205, 209)',

  tooltipBackground: 'rgb(233, 233, 233)',
});

export const darkTheme = themeToVariables({
  background: 'rgb(32, 33, 36)',
  foreground: 'rgb(213, 213, 213)',

  cssAtRule: 'rgb(128, 134, 139)',
  cssNumber: 'rgb(181, 206, 168)',
  cssProperty: 'rgb(156, 220, 254)',
  cssPunctuation: 'rgb(167, 167, 167)',
  cssSelector: 'rgb(175, 165, 143)',

  slotNameBackground: 'rgb(51, 51, 51)',
  slotNameBorder: 'rgb(73, 76, 80)',

  tooltipBackground: 'rgb(69, 69, 69)',
});
