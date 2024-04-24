// import { UNSUPPORTED_CSS_PROPERTIES } from '@griffel/core';

import type { MdnData, MdnShorthandProperty } from './types';
import { isShorthandProperty, isVendorProperty, toCamelCase } from './utils';

// TODO: use UNSUPPORTED_CSS_PROPERTIES from @griffel/core
const UNSUPPORTED_CSS_PROPERTIES = {
  all: 1,
  borderColor: 1,
  borderStyle: 1,
  borderWidth: 1,

  borderBlock: 1,
  borderBlockEnd: 1,
  borderBlockStart: 1,

  borderInline: 1,
  borderInlineEnd: 1,
  borderInlineStart: 1,
};

function isSupportedShorthand(property: string): boolean {
  return !Object.prototype.hasOwnProperty.call(UNSUPPORTED_CSS_PROPERTIES, toCamelCase(property));
}

export function filterShorthandsProperties(data: MdnData) {
  const filteredData: Record<string, MdnShorthandProperty> = {};

  for (const [property, value] of Object.entries(data)) {
    if (value.status === 'obsolete' || isVendorProperty(property) || !isShorthandProperty(value)) {
      continue;
    }

    if (isSupportedShorthand(property)) {
      filteredData[property] = {
        computed: value.computed.filter(isSupportedShorthand),
        status: value.status,
      };
    }
  }

  return filteredData;
}
