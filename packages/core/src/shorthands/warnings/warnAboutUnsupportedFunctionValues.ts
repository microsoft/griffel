import type { GriffelStyle } from '@griffel/style-types';
import { logError } from './logError';

export function warnAboutUnsupportedFunctionValues(property: string, value: GriffelStyle[keyof GriffelStyle]) {
  logError(
    [
      `@griffel/core: You are using unsupported value for the shorthand CSS function ("shorthands.${property}"). ` +
        `Please check your "makeStyles" calls, there *should not* be following:`,
      ' '.repeat(2) + `makeStyles({`,
      ' '.repeat(4) + `[slot]: { ...shorthands.${property}("${value}") }`,
      ' '.repeat(2) + `})`,
      '',
      'API reference: https://griffel.js.org/react/api/shorthands',
    ].join('\n'),
  );
}
