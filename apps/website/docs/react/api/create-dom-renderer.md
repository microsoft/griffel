---
sidebar_position: 4
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
