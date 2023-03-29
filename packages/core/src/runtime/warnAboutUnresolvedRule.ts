import type { GriffelResetStyle, GriffelStyle } from '../types';

export function warnAboutUnresolvedRule(property: string, value: GriffelStyle | GriffelResetStyle) {
  if (process.env.NODE_ENV === 'production' || typeof document === 'undefined') {
    return;
  }

  const ruleText = JSON.stringify(value, null, 2);
  const message: string[] = [
    '@griffel/react: A rule was not resolved to CSS properly. ' +
      'Please check your `makeStyles` or `makeResetStyles` calls for following:',
    ' '.repeat(2) + 'makeStyles({',
    ' '.repeat(4) + `[slot]: {`,
    ' '.repeat(6) +
      `"${property}": ${ruleText
        .split('\n')
        .map((l, n) => ' '.repeat(n === 0 ? 0 : 6) + l)
        .join('\n')}`,
    ' '.repeat(4) + '}',
    ' '.repeat(2) + `})`,
    '',
  ];

  if (property.indexOf('&') === -1) {
    message.push(
      `It looks that you're are using a nested selector, but it is missing an ampersand placeholder where the generated class name should be injected.`,
    );
    message.push(`Try to update a property to include it i.e "${property}" => "&${property}".`);
  } else {
    message.push('');
    message.push(
      "If it's not obvious what triggers a problem, please report an issue at https://github.com/microsoft/griffel/issues",
    );
  }

  // eslint-disable-next-line no-console
  console.error(message.join('\n'));
}
