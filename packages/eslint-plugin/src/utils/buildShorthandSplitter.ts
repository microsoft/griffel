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
 * Splits a string into an array of CSS functions and values.
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
    return parts.map(part => part.trim());
  };
}
