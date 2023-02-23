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
