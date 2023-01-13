---
sidebar_position: 1
---

import OutputTitle from '@site/src/components/OutputTitle'

# makeStyles

Is used to define styles, returns [a React hook](https://reactjs.org/docs/hooks-intro.html) that should be called inside a component:

```jsx
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  button: { color: 'red' },
  icon: { paddingLeft: '5px' },
});

function Component() {
  const classes = useClasses();

  return (
    <div>
      <button className={classes.button} />
      <span className={classes.icon} />
    </div>
  );
}
```

### Nesting selector

:::caution Use with caution

One of the promises of Atomic CSS is reducing the amount of styles, however more selectors are created when nested.

:::

The `&` character references the parent selector(s):

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    '& .foo': { color: 'green' },
    '&.bar': { color: 'red' },
  },
});
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
.f15f830o .foo {
  color: green;
}
.fns74iw.bar {
  color: red;
}
```

:::tip

As in CSS spacing between `&` and a selector matters, [What’s the Difference?](https://css-tricks.com/whats-the-difference/)

:::

### Pseudo-classes

These rules are transformed to receive a nesting selector:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ':active': { color: 'pink' },
    ':hover': { color: 'blue' },
    // 💡 :link, :focus, etc. are also supported

    ':nth-child(2n)': { backgroundColor: '#fafafa' },
  },
});
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
.fqsesyh:active {
  color: pink;
}
.f10q6zxg:hover {
  color: blue;
}
.fnbrw4x:nth-child(2n) {
  background-color: #fafafa;
}
```

### Pseudo-elements

Griffel supports pseudo-elements like `::before` and `::after`.

```ts
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    '::after': {
      content: '""', // Note the nested quotes
    },
  },
});
```

:::caution

When setting content on pseudo elements, make sure to use nested quotes, e.g. `content: '"hello"'`

This also applies for empty content: `content: '""'`.

:::

### `:global()` selector

Another useful feature is `:global()` selector, it associates local styles with global selectors.

```ts
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ':global(html[data-whatintent="mouse"])': { backgroundColor: 'yellow' },
  },
});
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
html[data-whatintent='mouse'] .f1xz3i88 {
  background-color: yellow;
}
```

### At-rules

`@media`, `@supports` & `@layer` queries are also supported:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    '@media screen and (max-width: 992px)': { color: 'orange' },
    '@supports (display: grid)': { color: 'red' },
    '@layer utility': { marginBottom: '1em' },
  },
});
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
@media screen and (max-width: 992px) {
  .f5d6c3d {
    color: orange;
  }
}
@supports (display: grid) {
  .f1ofq0jl {
    color: red;
  }
}

@layer utility {
  .f2d3jla {
    margin-bottom: 1em;
  }
}
```

### `@keyframes` (animations)

`keyframes` are supported via `animationName` property that can be defined as an object:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    animationIterationCount: 'infinite',
    animationDuration: '3s',
    animationName: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },
});
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
.f1cpbl36 {
  animation-iteration-count: infinite;
}
.f1a27w2r {
  animation-duration: 3s;
}
.f1g6ul6r {
  animation-name: f1q8eu9e;
}
@keyframes f1q8eu9e {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

`animationName` can be also an array of styles objects:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  asArray: {
    animationIterationCount: 'infinite',
    animationDuration: '3s',
    animationName: [
      {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      {
        from: { height: '100px' },
        to: { height: '200px' },
      },
    ],
  },
});
```

### CSS Fallback Properties

Griffel supports CSS fallback properties in order to support older browsers.

Any CSS property accepts an array of values which are all added to the styles.
Every browser will use the latest valid value (which might be a different one in different browsers, based on supported CSS in that browser):

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    overflowY: ['scroll', 'overlay'],
  },
});
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
.f1qdoogn {
  overflow-y: scroll; /* Fallback for browsers which do not support overflow: overlay */
  overflow-y: overlay; /* Used by browsers which support overflow: overlay */
}
```

### RTL support

Griffel uses [rtl-css-js](https://github.com/kentcdodds/rtl-css-js) to perform automatic flipping of properties and values in Right-To-Left (RTL) text direction defined by [`TextDirectionProvider`](/react/api/text-direction-provider).

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    paddingLeft: '10px',
  },
});
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
/* Will be applied in LTR */
.frdkuqy {
  padding-left: 10px;
}
/* Will be applied in RTL */
.f81rol6 {
  padding-right: 10px;
}
```

You can also control which rules you don't want to flip by adding a `/* @noflip */` CSS comment to your rule:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    paddingLeft: '10px /* @noflip */',
  },
});
```

<OutputTitle>Produces following CSS...</OutputTitle>

```css
/* Will be applied in LTR & RTL */
.f6x5cb6 {
  padding-left: 10px;
}
```

:::caution

Values than contain CSS variables might not be always converted, for example:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    // ⚠️ "boxShadow" will not be flipped in this example
    boxShadow: 'var(--box-shadow)',
  },
});
```
