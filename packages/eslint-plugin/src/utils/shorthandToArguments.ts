import type * as CSS from 'csstype';

interface ShorthandSplitterOptions {
  /**
   * Character to split on.
   * @default ' '
   */
  separator?: string;
  /**
   * Unit to use for numbers, such as `px` or `em`.
   * @default '' for unitless number
   */
  numberUnit?: string;
}

/**
 * Returns a function to split a string into an array of CSS functions and values.
 * If a separator is encountered inside of a function, it is ignored.
 * If a number is provided, we convert it to a string using the given unit.
 */
export function buildShorthandSplitter(options: ShorthandSplitterOptions = {}) {
  const { separator = ' ', numberUnit = '' } = options;

  return function split(value: string | number): string[] {
    // If a number is provided, we convert it to a string and append the number suffix.
    if (typeof value !== 'string') {
      if (value === 0) {
        value = '0';
      } else {
        value = `${value}${numberUnit}`;
      }
      // Numbers are always a single value
      return [value];
    }

    const isImportant = value.includes('!important');
    if (isImportant) {
      value = value.replace(/!important/g, '');
    }
    value = value.trim();

    // How many `(` have been opened but not closed.
    let unclosedParenthesis = 0;
    // If whitespace was just encountered, we don't want to split on the next separator.
    let justSplit = false;
    let partStartIndex = 0;
    const parts = [];

    for (let i = 0; i < value.length; i++) {
      switch (value[i]) {
        case separator:
          if (!justSplit && unclosedParenthesis === 0) {
            parts.push(value.slice(partStartIndex, i));
            partStartIndex = i + 1;
            justSplit = true;
          }
          continue;
        case '(':
          unclosedParenthesis++;
          break;
        case ')':
          unclosedParenthesis--;
          break;
      }
      justSplit = false;
    }

    if (!justSplit) {
      parts.push(value.slice(partStartIndex));
    }
    return parts.map(part => {
      part = part.trim();
      if (isImportant) {
        return `${part} !important`;
      } else {
        return part;
      }
    });
  };
}

// This collection is a map simply for faster access when checking if a CSS property is unsupported
// @griffel/core has the same definition, but ESLint plugin should not depend on it
export const UNSUPPORTED_CSS_PROPERTIES: Record<keyof CSS.StandardShorthandProperties, true> = {
  all: true,
  animation: true,
  animationRange: true,
  background: true,
  backgroundPosition: true,
  border: true,
  borderBlock: true,
  borderBlockEnd: true,
  borderBlockStart: true,
  borderBottom: true,
  borderColor: true,
  borderImage: true,
  borderInline: true,
  borderInlineEnd: true,
  borderInlineStart: true,
  borderLeft: true,
  borderRadius: true,
  borderRight: true,
  borderStyle: true,
  borderTop: true,
  borderWidth: true,
  caret: true,
  columns: true,
  columnRule: true,
  containIntrinsicSize: true,
  container: true,
  flex: true,
  flexFlow: true,
  font: true,
  gap: true,
  grid: true,
  gridArea: true,
  gridColumn: true,
  gridRow: true,
  gridTemplate: true,
  inset: true,
  insetBlock: true,
  insetInline: true,
  lineClamp: true,
  listStyle: true,
  margin: true,
  marginBlock: true,
  marginInline: true,
  mask: true,
  maskBorder: true,
  motion: true,
  offset: true,
  outline: true,
  overflow: true,
  overscrollBehavior: true,
  padding: true,
  paddingBlock: true,
  paddingInline: true,
  placeItems: true,
  placeContent: true,
  placeSelf: true,
  scrollMargin: true,
  scrollMarginBlock: true,
  scrollMarginInline: true,
  scrollPadding: true,
  scrollPaddingBlock: true,
  scrollPaddingInline: true,
  scrollSnapMargin: true,
  scrollTimeline: true,
  textDecoration: true,
  textEmphasis: true,
  transition: true,
  viewTimeline: true,
};

const pxSplitter = buildShorthandSplitter({ numberUnit: 'px' });

// Transforms shorthand string into args for griffel shorthands.<name>() function.
const SHORTHAND_FUNCTIONS: Partial<Record<string, ReturnType<typeof buildShorthandSplitter>>> = {
  border: pxSplitter,
  borderLeft: pxSplitter,
  borderBottom: pxSplitter,
  borderRight: pxSplitter,
  borderTop: pxSplitter,
  borderColor: pxSplitter,
  borderStyle: pxSplitter,
  borderRadius: pxSplitter,
  borderWidth: pxSplitter,
  // Instead of converting to pixels, convert to flex-grow value.
  flex: buildShorthandSplitter({ numberUnit: '' }),
  gap: pxSplitter,
  // Split every `/` character (and trim whitespace)
  gridArea: buildShorthandSplitter({ separator: '/' }),
  margin: pxSplitter,
  marginBlock: pxSplitter,
  marginInline: pxSplitter,
  padding: pxSplitter,
  paddingBlock: pxSplitter,
  paddingInline: pxSplitter,
  overflow: pxSplitter,
  inset: pxSplitter,
  outline: pxSplitter,
  textDecoration: pxSplitter,
} satisfies Partial<Record<keyof typeof UNSUPPORTED_CSS_PROPERTIES, ReturnType<typeof buildShorthandSplitter>>>;

/**
 * Tries to split a string into an array of CSS functions and values.
 * The shorthand name is used to determine how to split the string.
 */
export function shorthandToArguments(shorthandName: string, value: string | number): string[] | undefined {
  return SHORTHAND_FUNCTIONS[shorthandName]?.(value);
}
