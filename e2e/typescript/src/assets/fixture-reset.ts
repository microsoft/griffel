import type { GriffelResetStyle } from '@griffel/style-types';

function assertType(style: GriffelResetStyle): GriffelResetStyle {
  return style;
}

// Animation
assertType({ animationName: 'foo' });
assertType({
  animationName: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
});
assertType({
  animationName: [
    {
      from: { opacity: 0 },
      to: { opacity: 0 },
    },
    {
      from: { height: 0 },
      to: { height: '200px' },
    },
  ],
});
assertType({
  animationName: {
    from: { '--opacity': '0' },
    to: { '--opacity': '1' },
  },
});

assertType({
  // @ts-expect-error "200" is not a valid CSS value for "height"
  animationName: {
    to: { height: 200 },
  },
});
assertType({
  // @ts-expect-error Only strings can be used as values for CSS variables
  animationName: {
    from: { '--opacity': 0 },
  },
});

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

assertType({
  ':hover': { content: "'foo'" },
});
assertType({
  ':hover': { animationName: { from: {}, to: {} } },
});

assertType({
  // @ts-expect-error Values of selectors can be only objects
  ':hover': 'red',
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
  '&.bar': { color: 'beige' },
  '&.foo': { padding: '5px' },
  '&.qux': { paddingLeft: '5px' },
});

assertType({
  '&.bar': { '--color': 'red' },
});
assertType({
  '&.bar': { animationName: { from: {}, to: {} } },
});

// Nested custom selectors
//

assertType({
  '&.foo': {
    '&.bar': { flexShrink: 0 },
    '&.baz': { flexShrink: 'initial' },
    '&.qux': { opacity: 0 },
    '&.fred': { zIndex: 0 },
    '&.thud': { zIndex: 1 },
  },
  '&.bar': {
    '&.baz': { color: 'beige' },
    '&.qux': { paddingLeft: '5px' },
  },
  '&.baz': {
    '&.qux': {
      '--color': 'red',
    },
  },
  '&.qux': {
    '&.bar': { flexShrink: 'var(--bar)' },
    '&.baz': { opacity: 'var(--baz)' },
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
  '@media(forced-colors: active)': {
    ...typedMixin,
    color: 'var(--customColor)',
  },
  ':after': {
    ...typedMixin,
  },
  ':before': {
    ...typedMixin,
    color: 'var(--customColor)',
  },
  '& .foo': {
    ...typedMixin,
  },
  '& .bar': {
    ...typedMixin,
    color: 'var(--customColor)',
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
  ':hover:focus': {
    // @ts-expect-error "1" is invalid value for "overflowX"
    overflowX: '1',
  },
});

assertType({
  ':hover:focus': {
    // @ts-expect-error "paddingLeft" cannot be numeric value
    paddingLeft: 5,
  },
});

assertType({
  ':hover:focus': {
    // @ts-expect-error "1" is invalid value for "overflowX"
    overflowX: '1',
    padding: 0,
    // @ts-expect-error paddingLeft cannot be a numeric value
    paddingLeft: 5,
  },
});

assertType({
  ':hover:focus': {
    // @ts-expect-error Object is not assignable to CSS property
    zIndex: { color: 'red' },
    // @ts-expect-error Object is not assignable to CSS property
    opacity: { color: 'red' },
  },
  ':hover:active': {
    // @ts-expect-error Object is not assignable to CSS property
    opacity: { color: 'red' },
    // @ts-expect-error Object is not assignable to CSS property
    zIndex: { color: 'red' },
  },
});

// Nested custom selectors
//

assertType({
  '&.foo': {
    '&.baz': {
      // @ts-expect-error "1" is invalid value for "overflowX"
      overflowX: '1',
      padding: 0,
      // @ts-expect-error paddingLeft cannot be a numeric value
      paddingLeft: 5,
    },
  },
});
assertType({
  '&.foo': {
    // @ts-expect-error outline-box is an invalid value for box-sizing
    boxSizing: 'outline-box',

    '&.bar': {
      // @ts-expect-error outline-box is an invalid value for box-sizing
      boxSizing: 'outline-box', // < no error here, TS only reports the error for the whole object
    },
  },
});
assertType({
  '&.foo': {
    // @ts-expect-error outline-box is an invalid value for box-sizing
    boxSizing: 'outline-box',
    zIndex: 1,

    '&.bar': {
      // @ts-expect-error outline-box is an invalid value for box-sizing
      boxSizing: 'outline-box',
      zIndex: 1,
    },
  },
});
assertType({
  '&.foo': {
    // @ts-expect-error Object is not assignable to CSS property
    zIndex: { color: 'red' },
    // @ts-expect-error Object is not assignable to CSS property
    opacity: { color: 'red' },

    '&.bar': {
      // @ts-expect-error Object is not assignable to CSS property
      zIndex: { color: 'red' },
      // @ts-expect-error Object is not assignable to CSS property
      opacity: { color: 'red' },
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
  ':hover:active': {
    paddingLeft: [
      '2px',
      // @ts-expect-error "paddingLeft" cannot be numeric value
      2,
    ],
  },
});
