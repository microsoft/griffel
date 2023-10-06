import type { GriffelStylesCSSValue } from '@griffel/style-types';
import type * as CSS from 'csstype';

const LINE_STYLES: CSS.DataType.LineStyle[] = [
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
];

export function isBorderStyle(
  value: GriffelStylesCSSValue | GriffelStylesCSSValue[] | null,
): value is CSS.DataType.LineStyle {
  return LINE_STYLES.includes(value as CSS.DataType.LineStyle);
}
