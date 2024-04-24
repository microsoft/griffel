import type { MdnShorthandProperty } from './types';
import { toCamelCase } from './utils';

const ADDITIONAL_SHORTHANDS: Record<string, string[]> = {
  border: ['border-top', 'border-right', 'border-bottom', 'border-left'],
};

function mergeProperties(targetProperty: string, preparedProperties: Record<string, string[]>) {
  for (const property of preparedProperties[targetProperty]) {
    const mergeProperties = [...(preparedProperties[property] ?? []), ...preparedProperties[targetProperty]];
    const uniqueProperties = Array.from(new Set(mergeProperties));

    preparedProperties[targetProperty] = uniqueProperties.sort();
  }

  return preparedProperties;
}

export function prepareProperties(shorthandsData: Record<string, MdnShorthandProperty>) {
  const preparedProperties: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(shorthandsData)) {
    const propertyName = toCamelCase(key);
    const properties = value.computed.concat(ADDITIONAL_SHORTHANDS[key] ?? []).map(toCamelCase);

    preparedProperties[propertyName] = properties;
  }

  for (const key of Object.keys(preparedProperties)) {
    mergeProperties(key, preparedProperties);
  }

  return preparedProperties;
}
