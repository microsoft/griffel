---
sidebar_position: 6
---

# createDOMRenderer

`createDOMRenderer` is paired with `RendererProvider` component and is useful for [child window rendering](/react/guides/child-window-rendering) and [SSR](/react/guides/ssr-usage) scenarios. This is the default renderer for web, and will make sure that styles are injected to a document.

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

For mobile-first methodology, you can consider to use [`sort-css-media-queries`](https://github.com/dutchenkoOleg/sort-css-media-queries):

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
