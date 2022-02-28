---
sidebar_position: 5
---

# Child Window/Shadow DOM Rendering

When rendering on the main browser window, many components need access to window or document for applying styling, listening for events, or measuring things. However it is possible to render to child windows and elements hosted in iframe elements.

In these cases, the target element is hosted in a different context, and thus have a different window reference. To aid in providing components with the correct instances of window or document, React context can be used to provide the tree of React components with the correct instance.

## Configuring rendering

We need to configure a renderer for makeStyles() and pass a targetDocument to FluentProvider:

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

You can check complete example at [CodeSandbox](https://codesandbox.io/s/griffel-react-rendering-into-iframe-btezpu).
