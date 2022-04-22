---
sidebar_position: 3
---

# shorthands

`shorthands` provides a set of functions to mimic [CSS shorthands](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) and improve developer experience as [CSS shorthands are not supported](/react/guides/limitations#css-shorthands-are-not-supported) by Griffel. For example:

```tsx
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    // ❌ This is not supported, TypeScript compiler will throw, styles will not be inserted to DOM
    padding: '2px 4px 8px 16px',
    // ✅ Use shorthand functions to avoid writting CSS longhands
    ...shorthands.padding('2px', '4px', '8px', '16px'),
  },
});
```

:::caution

The most of the functions follow syntax in matching CSS properties, but each value should a separate argument:

```js
// ❌ Will produce wrong results
shorthands.padding('2px 4px');
// ✅ Correct output
shorthands.padding('2px', '4px');
```

:::

Function in a `shorthand` set are pure, you can simply use `console.log` to better understand produced rules:

```js
console.log(padding('12px', '24px', '36px', '48px'));
// ⬇️⬇️⬇️
// {
//  paddingBottom: '36px',
//  paddingLeft: '48px',
//  paddingRight: '24px',
//  paddingTop: '12px',
// }
```

### `shorthands.border`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ...shorthands.border('2px'),
    ...shorthands.border('2px', 'solid'),
    ...shorthands.border('2px', 'solid', 'red'),
  },
});
```

### `shorthands.borderBottom`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    // The same is true for "borderTop", "borderLeft" & "borderRight"
    ...shorthands.borderBottom('2px'),
    ...shorthands.borderBottom('2px', 'solid'),
    ...shorthands.borderBottom('2px', 'solid', 'red'),
  },
});
```

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

### `shorthands.gap`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ...shorthands.gap('12px'),
    ...shorthands.gap('12px', '24px'),
  },
});
```

### `shorthands.margin`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ...shorthands.margin('12px'),
    ...shorthands.margin('12px', '24px'),
    ...shorthands.margin('12px', '24px', '36px'),
    ...shorthands.margin('12px', '24px', '36px', '48px'),
  },
});
```

### `shorthands.overflow`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ...shorthands.overflow('visible'),
    ...shorthands.overflow('visible', 'hidden'),
  },
});
```

### `shorthands.padding`

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    ...shorthands.padding('12px'),
    ...shorthands.padding('12px', '24px'),
    ...shorthands.padding('12px', '24px', '36px'),
    ...shorthands.padding('12px', '24px', '36px', '48px'),
  },
});
```
