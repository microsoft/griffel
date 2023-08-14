// Matches CSS functions, i.e. `rgb(255, 255, 255)` or `var(--color)`, as well as CSS values, i.e. `1px`, `solid`, and `red`.
export const CSS_FUNCTION_OR_VALUE = /(?:[a-zA-Z]+\([^()]*\)|[#\w-]+)/g;

/**
 * Splits a string into an array of CSS functions and values.
 * If a number is provided, we assume it represents a pixel value.
 */
export function splitShorthandIntoParts(value: string | number): string[] | null {
  if (typeof value !== 'string') {
    if (value === 0) {
      value = '0';
    } else {
      value = `${value}px`;
    }
  }
  return value.match(CSS_FUNCTION_OR_VALUE);
}
