import type { GriffelStylesStrictCSSObject } from '../types';
import { GridAreaInput } from './types';

type GridAreaStyle = Pick<
  GriffelStylesStrictCSSObject,
  'gridRowStart' | 'gridRowEnd' | 'gridColumnStart' | 'gridColumnEnd'
>;

const cssVarRegEx = /var\(.*\)/gi;

function isValidGridAreaInput(value: GridAreaInput) {
  return value === undefined || typeof value === 'number' || (typeof value === 'string' && !cssVarRegEx.test(value));
}

// A custom-ident can be an alpha-numeric string including dash (-), underscore, escaped (\) characters, and escaped unicode
const customIdentRegEx = /^[a-zA-Z0-9\-_\\#;]+$/;
const nonCustomIdentRegEx = /^-moz-initial$|^auto$|^initial$|^inherit$|^revert$|^unset$|^span \d+$|\d.*/;

// See https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
function isCustomIdent(value: GridAreaInput | undefined): boolean {
  return (
    value !== undefined && typeof value === 'string' && customIdentRegEx.test(value) && !nonCustomIdentRegEx.test(value)
  );
}

export function gridArea(all: GridAreaInput): GridAreaStyle;
export function gridArea(rowStart: GridAreaInput, columnStart: GridAreaInput): GridAreaStyle;
export function gridArea(rowStart: GridAreaInput, columnStart: GridAreaInput, rowEnd: GridAreaInput): GridAreaStyle;
export function gridArea(
  rowStart: GridAreaInput,
  columnStart: GridAreaInput,
  rowEnd: GridAreaInput,
  columnEnd: GridAreaInput,
): GridAreaStyle;

/**
 * A function that implements CSS spec conformant expansion for "grid-area"
 *
 * @example
 *   gridArea('auto')
 *   gridArea('first', 'second')
 *   gridArea(2, 4, 4)
 *   gridArea(2, 4, 1, 3)
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area
 */
export function gridArea(...values: GridAreaInput[]): GridAreaStyle {
  // if any value is not valid, then do not apply the CSS.
  if (values.some(value => !isValidGridAreaInput(value))) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(
        `The value passed to shorthands.gridArea() did not match any gridArea property specs. The CSS styles were not generated. Please, check the gridArea documentation.`,
        [
          'The value passed to shorthands.gridArea() did not match any gridArea property specs. ',
          'The CSS styles were not generated.\n',
          'Please, check the `grid-area` documentation:\n',
          '- https://developer.mozilla.org/docs/Web/CSS/grid-area',
          '- https://griffel.js.org/react/api/shorthands#shorthandsgridarea',
        ].join(''),
      );
    }

    return {};
  }
  const gridRowStart = values[0] !== undefined ? values[0] : 'auto';

  // When grid-column-start is omitted, if grid-row-start is a <custom-ident>,
  // all four longhands are set to that value.
  // Otherwise, it is set to auto.
  const gridColumnStart = values[1] !== undefined ? values[1] : isCustomIdent(gridRowStart) ? gridRowStart : 'auto';

  // When grid-row-end is omitted,
  // if grid-row-start is a <custom-ident>, grid-row-end is set to that <custom-ident>;
  // otherwise, it is set to auto.
  const gridRowEnd = values[2] !== undefined ? values[2] : isCustomIdent(gridRowStart) ? gridRowStart : 'auto';

  // When grid-column-end is omitted,
  // if grid-column-start is a <custom-ident>, grid-column-end is set to that <custom-ident>;
  // otherwise, it is set to auto.
  const gridColumnEnd = values[3] !== undefined ? values[3] : isCustomIdent(gridColumnStart) ? gridColumnStart : 'auto';

  return {
    gridRowStart,
    gridColumnStart,
    gridRowEnd,
    gridColumnEnd,
  };
}
