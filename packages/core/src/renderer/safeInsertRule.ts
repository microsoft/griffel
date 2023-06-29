/**
 * Suffixes to be ignored in case of error
 */
const ignoreSuffixes = [
  '-moz-placeholder',
  '-moz-focus-inner',
  '-moz-focusring',
  '-ms-input-placeholder',
  '-moz-read-write',
  '-moz-read-only',
].join('|');
const ignoreSuffixesRegex = new RegExp(`:(${ignoreSuffixes})`);

/**
 * @internal
 *
 * Calls `sheet.insertRule` and catches errors related to browser prefixes.
 */
export function safeInsertRule(sheet: { insertRule(rule: string): number | undefined }, ruleCSS: string): void {
  try {
    sheet.insertRule(ruleCSS);
  } catch (e) {
    // We've disabled these warnings due to false-positive errors with browser prefixes
    if (process.env.NODE_ENV !== 'production' && !ignoreSuffixesRegex.test(ruleCSS)) {
      // eslint-disable-next-line no-console
      console.error(`There was a problem inserting the following rule: "${ruleCSS}"`, e);
    }
  }
}
