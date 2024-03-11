// import { UNSUPPORTED_CSS_PROPERTIES } from '@griffel/core';

import type { CSSShorthands, MdnData } from './types';
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
  return !Object.prototype.hasOwnProperty.call(UNSUPPORTED_CSS_PROPERTIES, property);
}

export function filterShorthandsProperties(data: MdnData) {
  return Object.entries(data).reduce((acc, [property, value]) => {
    if (value.status === 'obsolete' || isVendorProperty(property) || !isShorthandProperty(value)) {
      return acc;
    }

    const propertyName = toCamelCase(property);

    if (isSupportedShorthand(propertyName)) {
      acc[propertyName] = [-1, value.computed.map(toCamelCase).filter(isSupportedShorthand)];
    }

    return acc;
  }, {} as CSSShorthands);
}
