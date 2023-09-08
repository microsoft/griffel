# Postcss syntax for Griffel

A postcss [custom syntax](https://postcss.org/docs/how-to-write-custom-syntax) for Javascript files that contain
Griffel CSS in JS code.

## Parser

The parser will parse a Javascript file and return the CSS output of any Griffel `makeStyle` or `makeResetStyle`
calls. The parsed postcss AST will include source locations back to the original Javascript code.

## Stringifier

The stringifier only works on a postcss AST that was parsed by this custom syntax since Griffel ahead of time
compilation lacks the capability to map generated CSS back to the original javascript properties very accurately.


