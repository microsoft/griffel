import type { GriffelStyle } from '@griffel/core';
import { tokens } from './tokens';

export const flexStyles: GriffelStyle = {
  display: 'flex',
  flexDirection: 'column',
};

export const gridStyles = (gridGap: string): GriffelStyle => ({
  display: 'grid',
  gridRowGap: gridGap,
});

export const typography: Record<'text' | 'header', GriffelStyle> = {
  text: { fontWeight: tokens.fontWeightRegular },
  header: { fontWeight: 'bold' },
};
