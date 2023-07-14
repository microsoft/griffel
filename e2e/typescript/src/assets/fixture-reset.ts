import type { GriffelResetStyle } from '@griffel/style-types';

function assertType(style: GriffelResetStyle): GriffelResetStyle {
  return style;
}

// Animation
assertType({ animationName: 'foo' });

// Basic styles
//

assertType({ flex: 0 });
assertType({ flex: 1 });
assertType({ zIndex: 0 });
assertType({ zIndex: 1 });

assertType({ padding: '5px' });
assertType({ paddingLeft: '5px' });
assertType({ color: 'beige' });

// CSS variables
//

assertType({ fontWeight: 'var(--foo)' });
assertType({ flexShrink: 'var(--bar)' });
assertType({ opacity: 'var(--baz)' });
assertType({ zIndex: 'var(--qux)' });

assertType({ '--color': 'red' });

// Mixins
//

assertType({
  ...{ padding: '5px' },
  ...{ paddingLeft: '5px' },
  ...{ color: 'red' },
});

// Strict selector defined via "CSS.Pseudos"
//

assertType({
  ':hover': { flexShrink: 0 },
  ':focus': { flexShrink: 'initial' },
  ':active': { zIndex: 0 },
  ':visited': { zIndex: 1 },
});

assertType({
  ':hover': { fontWeight: 'var(--foo)' },
  ':focus': { flexShrink: 'var(--bar)' },
  ':active': { opacity: 'var(--bar)' },
  ':visited': { zIndex: 'var(--qux)' },
});

assertType({
  ':hover': { color: 'beige' },
  ':active': { padding: '5px' },
  ':focus': { paddingLeft: '5px' },
});

assertType({
  ':hover': { '--color': 'red' },
});

// Custom selectors
//

assertType({
  ':hover:focus': { flexShrink: 0 },
  ':hover:active': { flexShrink: 'initial' },
  ':hover:visited': { zIndex: 0 },
  ':hover:focus-visible': { zIndex: 1 },
});

assertType({
  ':link:hover': { fontWeight: 'var(--foo)' },
  ':link:focus': { flexShrink: 'var(--bar)' },
  ':link:active': { opacity: 'var(--bar)' },
  ':link:visited': { zIndex: 'var(--qux)' },
});

assertType({
  '.bar': { color: 'beige' },
  '.foo': { padding: '5px' },
  '.qux': { paddingLeft: '5px' },
});

assertType({
  '.bar': { '--color': 'red' },
});

// Nested custom selectors
//

assertType({
  '.foo': {
    '.bar': { flexShrink: 0 },
    '.baz': { flexShrink: 'initial' },
    '.qux': { opacity: 0 },
    '.fred': { zIndex: 0 },
    '.thud': { zIndex: 1 },
  },
  '.bar': {
    '.baz': { color: 'beige' },
    '.qux': { paddingLeft: '5px' },
  },
  '.baz': {
    '.qux': {
      '--color': 'red',
    },
  },
  '.qux': {
    '.bar': { flexShrink: 'var(--bar)' },
    '.baz': { opacity: 'var(--baz)' },
  },
});

// Invalid values
//

assertType({
  // @ts-expect-error "outline-box" is an invalid value for "box-sizing"
  boxSizing: 'outline-box',
});
assertType({
  // @ts-expect-error "1" is invalid value for "overflowX"
  overflowX: '1',
});
assertType({
  // @ts-expect-error "paddingLeft" cannot be numeric value
  paddingLeft: 5,
});
assertType({
  // @ts-expect-error "0" is invalid value for "color"
  color: 0,
});

assertType({
  // @ts-expect-error type check still fails on outline-box, not on any other line
  boxSizing: 'outline-box',
  zIndex: 1,
});
assertType({
  zIndex: 1,
  // @ts-expect-error type check still fails on outline-box, not on any other line
  boxSizing: 'outline-box',
});

assertType({
  // @ts-expect-error Object is not assignable to CSS property
  zIndex: { color: 'red' },
  // @ts-expect-error Object is not assignable to CSS property
  opacity: { color: 'red' },
});

// Mixins with invalid values
//

// @ts-expect-error Object in "zIndex" is not assignable to CSS property
assertType({
  ...{ zIndex: { color: 'red' } },
  ...{ color: 'red' },
});
// @ts-expect-error "outline-box" in "boxSizing" is an invalid value for "box-sizing"
assertType({
  ...{ boxSizing: 'outline-box' },
  ...{ color: 'red' },
});

// Just a type check, deep objects are not expected to be used as style mixins?
const typedMixin: GriffelResetStyle = {
  marginLeft: '5px',
  ':hover': {
    marginLeft: '6px',
    '--customColor': 'blue',
  },
  '--customColor': 'silver',
};

assertType({
  ...typedMixin,
  color: 'var(--customColor)',
});

assertType({
  '@media screen and (max-width: 992px)': {
    ...typedMixin,
  },
});

// Strict selectors
//

assertType({
  ':hover': {
    // @ts-expect-error "1" is invalid value for "overflowX"
    overflowX: '1',
    // @ts-expect-error "paddingLeft" cannot be numeric value
    paddingLeft: 5,
  },
});
assertType({
  ':hover': {
    // @ts-expect-error outline-box is an invalid value for box-sizing
    boxSizing: 'outline-box',
    zIndex: 1,
  },
});

// Custom selectors
//

assertType({
  // @ts-expect-error "1" is invalid value for "overflowX"
  ':hover:focus': {
    overflowX: '1',
  },
});

assertType({
  // @ts-expect-error "paddingLeft" cannot be numeric value
  ':hover:focus': {
    paddingLeft: 5,
  },
});

assertType({
  // @ts-expect-error "1" is invalid value for "overflowX", padding is banned, paddingLeft cannot be a numeric value
  ':hover:focus': {
    overflowX: 'scroll',
    padding: 0,
    paddingLeft: 5,
  },
});

assertType({
  ':hover:focus': {
    // @ts-expect-error Object is not assignable to CSS property
    zIndex: { color: 'red' },
    opacity: { color: 'red' }, // < no error here, TS only reports the first error in this case
  },
  ':hover:active': {
    // @ts-expect-error Object is not assignable to CSS property
    opacity: { color: 'red' },
    zIndex: { color: 'red' }, // < no error here, TS only reports the first error in this case
  },
});

// Nested custom selectors
//

assertType({
  // @ts-expect-error "1" is invalid value for "overflowX", padding is banned, paddingLeft cannot be a numeric value
  '.foo': {
    '.baz': {
      overflowX: '1',
      padding: 0,
      paddingLeft: 5,
    },
  },
});
assertType({
  // @ts-expect-error outline-box is an invalid value for box-sizing
  '.foo': {
    boxSizing: 'outline-box',

    '.bar': {
      boxSizing: 'outline-box', // < no error here, TS only reports the error for the whole object
    },
  },
});
assertType({
  // @ts-expect-error outline-box is an invalid value for box-sizing
  '.foo': {
    boxSizing: 'outline-box',
    zIndex: 1,

    '.bar': {
      boxSizing: 'outline-box', // < no error here, TS only reports the error for the whole object
      zIndex: 1,
    },
  },
});
assertType({
  '.foo': {
    // @ts-expect-error Object is not assignable to CSS property
    zIndex: { color: 'red' },
    opacity: { color: 'red' }, // < no error here, TS only reports the first error in this case

    '.bar': {
      zIndex: { color: 'red' }, // < no error here, TS only reports the first error in this case
      opacity: { color: 'red' }, // < no error here, TS only reports the first error in this case
    },
  },
});

// Fallback values
assertType({
  color: ['red', 'blue'],
  padding: [0, '2px'],
  paddingLeft: [0, '2px'],
  zIndex: [10, 20],
  ':hover': {
    color: ['red', 'blue'],
  },
  ':hover:active': {
    zIndex: [2],
    color: ['red', 'blue'],
    paddingLeft: [0, '2px'],
  },
});

assertType({
  paddingLeft: [
    // @ts-expect-error "paddingLeft" cannot be numeric value
    2,
    '2px',
  ],
  // @ts-expect-error "paddingLeft" cannot be numeric value
  ':hover:active': {
    paddingLeft: ['2px', 2],
  },
});
