import type { GriffelStaticStyles } from '@griffel/style-types';

function assertType(styles: GriffelStaticStyles): GriffelStaticStyles {
  return styles;
}

// Basic styles
//

assertType('html { line-height: 20px; }');

assertType({
  body: {
    color: 'red',
  },
});
assertType({
  '@font-face': {
    fontFamily: 'My Font',
    src: `url(my_font.woff)`,
  },
});

// Styles with fallbacks
//

assertType({
  body: {
    display: ['flex', '-webkit-flex'],
  },
});
