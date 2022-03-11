import { GriffelStyle } from '@griffel/core';

function assertType(style: GriffelStyle): GriffelStyle {
  return style;
}

// Animation
assertType({ animationName: 'foo' });

// Basic styles
//

assertType({ flexShrink: 0 });
assertType({ flexShrink: 1 });
assertType({ zIndex: 0 });
assertType({ zIndex: 1 });

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
  '.foo': { paddingLeft: '5px' },
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

// Banned shorthand properties
//

assertType({
  // @ts-expect-error "padding" is banned
  padding: 0,
});
assertType({
  // @ts-expect-error "borderLeft" is banned
  borderLeft: '5px',
});

// Invalid values
//

assertType({
  // @ts-expect-error "outline-box" is an invalid value for "box-sizing"
  boxSizing: 'outline-box',
});
assertType({
  // @ts-expect-error "1" is invalid value for "overflow"
  overflow: '1',
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

// Strict selectors
//

assertType({
  ':hover': {
    // @ts-expect-error "1" is invalid value for "overflow"
    overflow: '1',
    // @ts-expect-error "padding" is banned
    padding: 0,
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
    // @ts-expect-error "1" is invalid value for "overflow"
    overflow: '1',
    // @ts-expect-error "padding" is banned
    padding: 0,
    // @ts-expect-error "paddingLeft" cannot be numeric value
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
});

// Nested custom selectors
//

assertType({
  '.foo': {
    '.baz': {
      // @ts-expect-error "1" is invalid value for "overflow"
      overflow: '1',
      // @ts-expect-error "padding" is banned
      padding: 0,
      // @ts-expect-error "paddingLeft" cannot be numeric value
      paddingLeft: 5,
    },
  },
});
assertType({
  '.foo': {
    // @ts-expect-error outline-box is an invalid value for box-sizing
    boxSizing: 'outline-box',

    '.bar': {
      // @ts-expect-error outline-box is an invalid value for box-sizing
      boxSizing: 'outline-box',
    },
  },
});
assertType({
  '.foo': {
    // @ts-expect-error type check still fails on outline-box, not on any other line
    boxSizing: 'outline-box',
    zIndex: 1,

    '.bar': {
      // @ts-expect-error type check still fails on outline-box, not on any other line
      boxSizing: 'outline-box',
      zIndex: 1,
    },
  },
});
assertType({
  '.foo': {
    // @ts-expect-error Object is not assignable to CSS property
    zIndex: { color: 'red' },
    // @ts-expect-error Object is not assignable to CSS property
    opacity: { color: 'red' },

    '.bar': {
      // @ts-expect-error Object is not assignable to CSS property
      zIndex: { color: 'red' },
      // @ts-expect-error Object is not assignable to CSS property
      opacity: { color: 'red' },
    },
  },
});
