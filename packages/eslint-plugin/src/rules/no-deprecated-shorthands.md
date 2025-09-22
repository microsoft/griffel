# Ensure deprecated shorthands are not used (`@griffel/no-deprecated-shorthands`)

The latest versions of Griffel supports CSS shorthand properties. However, some of the shorthands are not supported: `borderColor`, `borderStyle` & `borderWidth`.

Examples of **incorrect** code for this rule:

```js
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.border('1px') // ❌ Will produce suboptimal results
  }
});
```

```js
import { makeStyles, shorthands } from '@griffel/react';

// ❌ Will produce suboptimal results
shorthands.border('1px')
```

Examples of **correct** code for this rule:

```js
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.borderColor('red')
  },
});
```
