import { GRIFFEL_DECLARATOR_LOCATION_RAW, GRIFFEL_SLOT_LOCATION_RAW } from './constants';
import * as stylelint from 'stylelint';
import * as postcss from 'postcss';

/**
 * A sample postProcessor that works with our post css parser
 *
 * @param results
 * @returns
 */
export function postProcessor(results: stylelint.LintResult[]) {
  results.forEach(result => {
    const updatedWarnings = result.warnings.map(warning => {
      if (!result._postcssResult) {
        return;
      }

      let updatedWarning = { ...warning };
      // TODO - why cast
      (result._postcssResult.root as postcss.Root).walk(node => {
        const cssInJSLocation = node.raws[GRIFFEL_DECLARATOR_LOCATION_RAW] || node.raws[GRIFFEL_SLOT_LOCATION_RAW];
        if (cssInJSLocation && node.source?.start && node.source?.end) {
          const { start, end } = node.source;
          if (
            start.line <= warning.line &&
            end.line >= warning.line &&
            start.column <= warning.column &&
            end.column >= warning.column
          ) {
            updatedWarning = {
              ...updatedWarning,
              line: cssInJSLocation.start.line,
              column: cssInJSLocation.start.column,
              endLine: cssInJSLocation.end.line,
              endColumn: cssInJSLocation.end.column,
            };
            return false;
          }
        }
      });
      return updatedWarning;
    });

    // Remove duplicated warnings.
    // pro - won't have multiple errors for RTL
    // cons - TODO - if two nested rules have both same error, eg `':hover': { color: '#111' },':focus': { color: '#111' }`, only one error will be shown
    const uniqueWarnings: stylelint.Warning[] = [];
    updatedWarnings.forEach(warning => {
      if (
        warning &&
        !uniqueWarnings.some(
          uniqueWarning =>
            uniqueWarning.line === warning.line &&
            uniqueWarning.column === warning.column &&
            uniqueWarning.text === warning.text,
        )
      ) {
        uniqueWarnings.push(warning);
      }
    });

    result.warnings = uniqueWarnings;
  });

  return results;
}
