import { GriffelStyle } from '@griffel/core';

function assertType(style: GriffelStyle): GriffelStyle {
  return style;
}

// Basic styles
//

assertType({ flexShrink: 0 });
assertType({ flexShrink: 1 });
assertType({ zIndex: 0 });
assertType({ zIndex: 1 });

assertType({ fontWeight: 'var(--foo)' });
assertType({ flexShrink: 'var(--bar)' });
assertType({ opacity: 'var(--baz)' });
assertType({ zIndex: 'var(--qux)' });

assertType({ color: 'beige' });
assertType({ paddingLeft: '5px' });

assertType({ '--color': 'red' });

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

// @ts-expect-error "padding" is banned
assertType({ padding: 0 });
// @ts-expect-error "borderLeft" is banned
assertType({ borderLeft: '5px' });

// Invalid values
//

// @ts-expect-error "1" is invalid value for "overflow"
assertType({ overflow: '1' });
// @ts-expect-error "paddingLeft" cannot be numeric value
assertType({ paddingLeft: 5 });
// @ts-expect-error "0" is invalid value for "color"
assertType({ color: 0 });

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
