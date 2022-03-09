import { GriffelStyle } from '@griffel/core';

function assertType(style: GriffelStyle): GriffelStyle {
  return style;
}

/* Fixtures for types that work properly only with TS <4. */

// Invalid values
//

assertType({
  // @ts-expect-error "outline-box" is invalid value for "boxSizing"
  boxSizing: 'outline-box',
});
assertType({
  // @ts-expect-error "outline-box" is invalid value for "boxSizing"
  boxSizing: 'outline-box',
  zIndex: 1,
});
assertType({
  // @ts-expect-error "zIndex" cannot be an object
  zIndex: { color: 'red' },
});

assertType({
  ':after': {
    // @ts-expect-error "outline-box" is invalid value for "boxSizing"
    boxSizing: 'outline-box',
    zIndex: 1,
  },
  '.foo': {
    // @ts-expect-error "outline-box" is invalid value for "boxSizing"
    boxSizing: 'outline-box',
    zIndex: 1,
  },
});
