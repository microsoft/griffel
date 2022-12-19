---
sidebar_position: 7
---

# TextDirectionProvider

`TextDirectionProvider` is used to define current text direction to be used to apply styles in the scope of its component, by default renders with Left-To-Right (LTR). For details, check [RTL support](/react/api/make-styles#rtl-support).

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
