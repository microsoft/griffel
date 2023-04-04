import type { GriffelStyle } from '../../types';
import { logError } from './logError';

export function warnAboutUnsupportedProperties(property: string, value: GriffelStyle[keyof GriffelStyle]) {
  logError(
    [
      `@griffel/react: You are using unsupported shorthand CSS property "${property}". ` +
        `Please check your "makeStyles" calls, there *should not* be following:`,
      ' '.repeat(2) + `makeStyles({`,
      ' '.repeat(4) + `[slot]: { ${property}: "${value}" }`,
      ' '.repeat(2) + `})`,
      '',
      'Learn why CSS shorthands are not supported: https://aka.ms/griffel-css-shorthands',
    ].join('\n'),
  );
}
