import { GriffelStyle } from '@griffel/core';
import { tokens } from './tokens';

export const createMixin = (rule: GriffelStyle): GriffelStyle => ({
  color: tokens.colorBrandBackground,
  ...rule,
});
