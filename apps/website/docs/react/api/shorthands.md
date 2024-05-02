---
sidebar_position: 3
---

# shorthands

`shorthands` provides a set of functions to mimic [CSS shorthands](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) and improve developer experience as [_some_ of CSS shorthands are not supported](/react/guides/limitations#css-shorthands-are-not-supported) by Griffel. For example:

```tsx
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    // ❌ This is not supported, TypeScript compiler will throw, styles will not be inserted to DOM
    borderColor: 'red',
    // ✅ Use shorthand functions to avoid writting CSS longhands
    ...shorthands.borderColor('red'),
  },
});
```

:::caution

The most of the functions follow syntax in matching CSS properties, but each value should a separate argument:

```js
// ❌ Will produce wrong results
shorthands.borderColor('red blue');
// ✅ Correct output
shorthands.borderColor('red', 'blue');
```

:::

Function in a `shorthand` set are pure, you can simply use `console.log` to better understand produced rules:

```js
console.log(borderColor('red'));
// ⬇️⬇️⬇️
// {
//  borderBottomColor: 'red',
//  borderLeftColor: 'red',
//  borderRightColor: 'red',
//  borderTopColor: 'red',
// }
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
