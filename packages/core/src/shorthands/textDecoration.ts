import type { GriffelStyle } from '@griffel/style-types';
import type {
  TextDecorationColorInput,
  TextDecorationLineInput,
  TextDecorationStyleInput,
  TextDecorationThicknessInput,
} from './types';

type TextDecorationStyle = Pick<
  GriffelStyle,
  'textDecorationStyle' | 'textDecorationLine' | 'textDecorationColor' | 'textDecorationThickness'
>;

/** @deprecated Use `{ textDecoration: 'none' }` instead as Griffel supports CSS shorthands now */
export function textDecoration(style: TextDecorationStyleInput): TextDecorationStyle;
/** @deprecated Use `{ textDecoration: 'dotted' }` instead as Griffel supports CSS shorthands now */
export function textDecoration(line: TextDecorationLineInput): TextDecorationStyle;

/** @deprecated Use `{ textDecoration: 'underline dotted' }` instead as Griffel supports CSS shorthands now */
export function textDecoration(line: TextDecorationLineInput, style: TextDecorationStyleInput): TextDecorationStyle;
/** @deprecated Use `{ textDecoration: 'underline dotted red' }` instead as Griffel supports CSS shorthands now */
export function textDecoration(
  line: TextDecorationLineInput,
  style: TextDecorationStyleInput,
  color: TextDecorationColorInput,
): TextDecorationStyle;
/** @deprecated Use `{ textDecoration: 'underline dotted red 2px' }` instead as Griffel supports CSS shorthands now */
export function textDecoration(
  line: TextDecorationLineInput,
  style: TextDecorationStyleInput,
  color: TextDecorationColorInput,
  thickness: TextDecorationThicknessInput,
): TextDecorationStyle;

/**
 * A function that implements expansion for "textDecoration" to all sides of an element, it's simplified - check usage examples.
 *
 * @example
 *  textDecoration('none')
 *  textDecoration('dotted')
 *  textDecoration('underline', 'dotted')
 *  textDecoration('underline', 'dotted', 'red')
 *  textDecoration('underline', 'dotted', 'red', '2px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration
 *
 * @deprecated Just use `{ textDecoration: 'underline dotted red 2px' }` instead as Griffel supports CSS shorthands now
 */
export function textDecoration(
  value: TextDecorationLineInput | TextDecorationStyleInput,
  ...values: [TextDecorationStyleInput?, TextDecorationColorInput?, TextDecorationThicknessInput?]
): TextDecorationStyle {
  if (values.length === 0) {
    return isTextDecorationStyleInput(value) ? { textDecorationStyle: value } : { textDecorationLine: value };
  }

  const [textDecorationStyle, textDecorationColor, textDecorationThickness] = values;

  return {
    textDecorationLine: value,
    ...(textDecorationStyle && { textDecorationStyle }),
    ...(textDecorationColor && { textDecorationColor }),
    ...(textDecorationThickness && { textDecorationThickness }),
  };
}

const textDecorationStyleInputs: TextDecorationStyleInput[] = ['dashed', 'dotted', 'double', 'solid', 'wavy'];

function isTextDecorationStyleInput(
  value: TextDecorationLineInput | TextDecorationStyleInput,
): value is TextDecorationStyleInput {
  return textDecorationStyleInputs.includes(value as TextDecorationStyleInput);
}
