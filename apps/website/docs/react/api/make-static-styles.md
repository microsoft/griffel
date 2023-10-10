---
sidebar_position: 4
---

import OutputTitle from '@site/src/components/OutputTitle'

# makeStaticStyles

Creates styles with a global selector. This is especially useful for CSS resets, for example [normalize.css](https://github.com/necolas/normalize.css/).

`makeStaticStyles` returns [a React hook](https://reactjs.org/docs/hooks-intro.html) that should be called inside a component.

## Defining styles with objects

```js
import { makeStaticStyles } from '@griffel/react';

const useStaticStyles = makeStaticStyles({
  '@font-face': {
    fontFamily: 'Open Sans',
    src: `url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
         url("/fonts/OpenSans-Regular-webfont.woff") format("woff")`,
  },
  body: {
    backgroundColor: 'red',
  },
});

function App() {
  useStaticStyles();

  return <div />;
}
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
@font-face {
  font-family: 'Open Sans';
  src: url('/fonts/OpenSans-Regular-webfont.woff2') format('woff2'), url('/fonts/OpenSans-Regular-webfont.woff') format('woff');
}
body {
  background-color: red;
}
```

:::caution Limited support for nested selectors

Nested selectors are not supported for this scenario via nesting of JavaScript objects.

```js
import { makeStaticStyles } from '@griffel/react';

const useStaticStyles = makeStaticStyles({
  // 🔴 Not supported
  '.some': {
    '.class': {
      /* ... */
    },
    ':hover': {
      /* ... */
    },
  },

  // ✅ Supported
  '.some.class': {
    /* ... */
  },
  '.some.class:hover': {
    /* ... */
  },
});
```

:::

## Defining multiple styles

Static styles can be defined with strings & arrays of strings/objects:

```jsx
import { makeStaticStyles } from '@griffel/react';

const useStaticStyles1 = makeStaticStyles('body { background: red; } .foo { color: green; }');
const useStaticStyles2 = makeStaticStyles([
  {
    '@font-face': {
      fontFamily: 'My Font',
      src: `url(my_font.woff)`,
    },
  },
  'html { line-height: 20px; }',
]);

function App() {
  useStaticStyles1();
  useStaticStyles2();

  return <div />;
}
```

:::note

`makeStaticStyles` supports the use of [shorthands](/react/api/shorthands) and does not have the same limitation as `makeStyles()`.

:::

## Usage with `makeStyles`

```tsx
import { makeStyles, makeStaticStyles, shorthands } from '@griffel/react';

const useStaticStyles = makeStaticStyles({
  body: {
    color: 'red',
    padding: '5px',
  },
});

const useClasses = makeStyles({
  primaryText: {
    color: 'blue',
    ...shorthands.padding('5px'),
  },
});

export default function App(props) {
  useStaticStyles();
  const classes = useClasses();

  return <p className={props.primaryText}>Hello world</p>;
}
```
