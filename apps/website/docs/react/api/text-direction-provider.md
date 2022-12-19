---
sidebar_position: 7
---

# TextDirectionProvider

`TextDirectionProvider` is used to determine the text direction for style computation. The default text direction is Left-To-Right (LTR). For more details, check [RTL support](/react/api/make-styles#rtl-support).

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
