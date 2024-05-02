# Griffel for React.js

A package with wrappers and APIs to be used with React.js.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [`makeStyles()`](#makestyles)
  - [Pseudo & class selectors, at-rules, global styles](#pseudo--class-selectors-at-rules-global-styles)
  - [Keyframes (animations)](#keyframes-animations)
  - [CSS Fallback Properties](#css-fallback-properties)
  - [RTL support](#rtl-support)
- [`mergeClasses()`](#mergeclasses)
- [`makeStaticStyles()`](#makestaticstyles)
- [`makeResetStyles()`](#makeresetstyles)
- [`createDOMRenderer()`, `RendererProvider`](#createdomrenderer-rendererprovider)
  - [compareMediaQueries](#comparemediaqueries)
  - [insertionPoint](#insertionpoint)
  - [styleElementAttributes](#styleelementattributes)
- [`TextDirectionProvider`](#textdirectionprovider)
- [Shorthands](#shorthands)
  - [`shorthands.borderColor`](#shorthandsbordercolor)
  - [`shorthands.borderStyle`](#shorthandsborderstyle)
  - [`shorthands.borderWidth`](#shorthandsborderwidth)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
npm install @griffel/react
# or
yarn add @griffel/react
```

## `makeStyles()`

Is used to define styles, returns a React hook that should be called inside a component:

```tsx
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

### Pseudo & class selectors, at-rules, global styles

`makeStyles()` supports pseudo, class selectors and at-rules.

```ts
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ':active': { color: 'pink' },
    ':hover': { color: 'blue' },
    // :link, :focus, etc.

    '.foo': { color: 'black' },
    ':nth-child(2n)': { backgroundColor: '#fafafa' },

    '@media screen and (max-width: 992px)': { color: 'orange' },
    '@container (max-width: 992px)': { color: 'orange' },
    '@container foo (max-width: 992px)': { color: 'orange' },
    '@supports (display: grid)': { color: 'red' },
    '@layer utility': { marginBottom: '1em' },
  },
});
```

Another useful feature is `:global()` selector, it allows connecting local styles with global selectors.

```ts
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ':global(html[data-whatintent="mouse"])': { backgroundColor: 'yellow' },
    // outputs: html[data-whatintent="mouse"] .abcd { background-color: yellow }
  },
});
```

### Keyframes (animations)

`keyframes` are supported via `animationName` property that can be defined as an object or an array of objects:

```tsx
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
  array: {
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

### RTL support

Griffel uses [rtl-css-js](https://github.com/kentcdodds/rtl-css-js) to perform automatic flipping of properties and values in Right-To-Left (RTL) text direction defined by `TextDirectionProvider`.

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    paddingLeft: '10px',
  },
});
```

⬇️⬇️⬇️

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

⬇️⬇️⬇️

```css
/* Will be applied in LTR & RTL */
.f6x5cb6 {
  padding-left: 10px;
}
```

## `mergeClasses()`

> 💡 **It is not possible to simply concatenate classes returned by `useClasses()`.**

There are cases where you need to merge classes from multiple `useClasses` calls.

To properly merge the classes, you need to use `mergeClasses()` function, which performs merge and deduplication of atomic classes generated by `makeStyles()`.

```tsx
import { mergeClasses, makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  blueBold: {
    color: 'blue',
    fontWeight: 'bold',
  },
  red: {
    color: 'red',
  },
});

function Component() {
  const classes = useClasses();

  const firstClassName = mergeClasses(classes.blueBold, classes.red); // { color: 'red', fontWeight: 'bold' }
  const secondClassName = mergeClasses(classes.red, classes.blueBold); // { color: 'blue', fontWeight: 'bold' }

  return (
    <>
      <div className={firstClassName} />
      <div className={secondClassName} />
    </>
  );
}
```

## `makeStaticStyles()`

Creates styles attached to a global selector. Styles can be defined via objects:

```tsx
import { makeStaticStyles } from '@griffel/react';

const useStaticStyles = makeStaticStyles({
  '@font-face': {
    fontFamily: 'Open Sans',
    src: `url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
         url("/fonts/OpenSans-Regular-webfont.woff") format("woff")`,
  },
  body: {
    background: 'red',
  },

  /**
   * ⚠️ nested and pseudo selectors are not supported for this scenario via nesting
   *
   * Not supported:
   * .some {
   *   .class { ... },
   *   ':hover': { ... }
   * }
   *
   * Supported:
   * '.some.class': { ... }
   * '.some.class:hover': { ... }
   */
});

function App() {
  useStaticStyles();

  return <div />;
}
```

Or with string & arrays of strings/objects:

```tsx
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

## `makeResetStyles()`

Atomic CSS has [tradeoffs](https://griffel.js.org/react/guides/atomic-css#trade-offs).
Once an element has many HTML class names each pointing to different CSS rules, browser layout times slow down.

There are cases when it's reasonable to flatten multiple declarations into monolithic CSS. For example, base styles for components in a UI library.
Rules generated by `makeResetStyles()` are inserted into the CSS style sheet before all the Atomic CSS, so styles from `makeStyles()` will always override these rules.

`makeResetStyles` returns a React hook that should be called inside a component:

```jsx
import { makeStyles, makeResetStyles } from '@griffel/react';
import { mergeClasses } from './mergeClasses';

const useBaseClass = makeResetStyles({
  color: 'red',
  padding: 0,
  // etc.
});

const useClasses = makeStyles({
  primary: { color: 'blue' },
  circular: {
    padding: '5px',
    borderRadius: '5px',
  },
});

function Component(props) {
  const baseClass = useBaseClass();
  const classes = useClasses();

  return (
    <button className={mergeClasses(baseClass, props.primary && classes.primary, props.circular && classes.circular)} />
  );
}
```

> ⚠️ Only one class generated by `makeResetStyles()` can be applied to an element. Otherwise, behavior will be non-deterministic as classes merging will not be done for this case and results depend on order of insertion.

```jsx
import { makeStyles } from '@griffel/react';

const useClassA = makeResetStyles({
  /* styles */
});
const useClassB = makeResetStyles({
  /* styles */
});

function Component(props) {
  /* 💣 Never apply multiple rules from makeResetStyles() to the same element */
  return <button className={mergeClasses(useClassA(), useClassB())} />;
}
```

## `createDOMRenderer()`, `RendererProvider`

`createDOMRenderer` is paired with `RendererProvider` component and is useful for child window rendering and SSR scenarios. This is the default renderer for web, and will make sure that styles are injected to a document.

```jsx
import { createDOMRenderer, RendererProvider } from '@griffel/react';

function App(props) {
  const { targetDocument } = props;
  const renderer = React.useMemo(() => createDOMRenderer(targetDocument), [targetDocument]);

  return (
    <RendererProvider renderer={renderer} targetDocument={targetDocument}>
      {/* Children components */}
      {/* ... */}
    </RendererProvider>
  );
}
```

### compareMediaQueries

A function with the same signature as sort functions in e.g. `Array.prototype.sort` for dynamically sorting media queries. Maps over an array of media query strings.

Griffel does not provide an opinionated default to sort media queries as the order may vary depending on the specific needs of the application.

```js
import { createDOMRenderer } from '@griffel/react';

const mediaQueryOrder = [
  'only screen and (min-width: 1366px)',
  'only screen and (min-width: 1366px)',
  'only screen and (min-width: 1920px)',
];

function sortMediaQueries(a, b) {
  return mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);
}

const renderer = createDOMRenderer(document, {
  compareMediaQueries,
});
```

```html
<html>
  <head>
    <style media="only screen and (min-width: 1024px)" data-make-styles-bucket="m"></style>
    <style media="only screen and (min-width: 1366px)" data-make-styles-bucket="m"></style>
    <style media="only screen and (min-width: 1920px)" data-make-styles-bucket="m"></style>
  </head>
</html>
```

For mobile-first methodology, you can consider using [`sort-css-media-queries`](https://github.com/dutchenkoOleg/sort-css-media-queries):

```js
import { createDOMRenderer } from '@griffel/react';
import sortCSSmq from 'sort-css-media-queries';

const renderer = createDOMRenderer(document, {
  compareMediaQueries: sortCSSmq,
});
```

```html
<html>
  <head>
    <style media="only screen and (min-width: 1px)" data-make-styles-bucket="m"></style>
    <style media="only screen and (min-width: 480px)" data-make-styles-bucket="m"></style>
    <style media="only screen and (min-width: 640px)" data-make-styles-bucket="m"></style>
  </head>
</html>
```

### insertionPoint

If specified, a renderer will insert created style tags after this element:

```js
import { createDOMRenderer } from '@griffel/react';

const insertionPoint = document.head.querySelector('#foo');
const renderer = createDOMRenderer(document, {
  insertionPoint,
});
```

```html
<html>
  <head>
    <style id="foo" />
    <!-- Style elements created by Griffel will be inserted after "#foo" element -->
    <style data-make-styles-bucket="d" />
    <style id="bar" />
  </head>
</html>
```

### styleElementAttributes

A map of attributes that's passed to the generated style elements. For example, is useful to set ["nonce" attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce).

```js
import { createDOMRenderer } from '@griffel/react';

const renderer = createDOMRenderer(document, {
  styleElementAttributes: {
    nonce: 'random',
  },
});
```

## `TextDirectionProvider`

`TextDirectionProvider` is used to determine the text direction for style computation. The default text direction is Left-To-Right (LTR).

```jsx
import { TextDirectionProvider } from '@griffel/react';

function App() {
  return (
    <>
      <TextDirectionProvider>
        {/* Inner components will have styles for LTR */}
        {/* ... */}
      </TextDirectionProvider>
      <TextDirectionProvider dir="rtl">
        {/* Inner components will have styles for RTL */}
        {/* ... */}
      </TextDirectionProvider>
    </>
  );
}
```

## Shorthands

`shorthands` provides a set of functions to mimic [CSS shorthands](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) and improve developer experience as [some of CSS shorthands are not supported](https://griffel.js.org/react/guides/limitations#css-shorthands-are-not-supported) by Griffel.

### `shorthands.borderColor`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ...shorthands.borderColor('red'),
    ...shorthands.borderColor('red', 'blue'),
    ...shorthands.borderColor('red', 'blue', 'green'),
    ...shorthands.borderColor('red', 'blue', 'green', 'yellow'),
  },
});
```

### `shorthands.borderStyle`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ...shorthands.borderStyle('solid'),
    ...shorthands.borderStyle('solid', 'dashed'),
    ...shorthands.borderStyle('solid', 'dashed', 'dotted'),
    ...shorthands.borderStyle('solid', 'dashed', 'dotted', 'double'),
  },
});
```

### `shorthands.borderWidth`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ...shorthands.borderWidth('12px'),
    ...shorthands.borderWidth('12px', '24px'),
    ...shorthands.borderWidth('12px', '24px', '36px'),
    ...shorthands.borderWidth('12px', '24px', '36px', '48px'),
  },
});
```
