---
sidebar_position: 5
---

# Child Window/Shadow DOM Rendering

When rendering in the main browser window, many components will need access to window or document to apply styles, listening for events, or measuring things. However it is possible to render to child windows and elements hosted in iframes.


## Configure rendering

We need to configure a renderer for `makeStyles()` and pass a `targetDocument` to `RendererProvider`:

```jsx
import { createDOMRenderer, RendererProvider } from '@griffel/react';
import React from 'react';

function MyComponent(props) {
  const { children, targetDocument } = props;
  const renderer = React.useMemo(() => createDOMRenderer(targetDocument), [targetDocument]);

  return (
    <RendererProvider renderer={renderer} targetDocument={targetDocument}>
      {children}
    </RendererProvider>
  );
}
```

You can check out the complete example in [CodeSandbox](https://codesandbox.io/s/griffel-react-rendering-into-iframe-btezpu).
