# Enforce that `makeStyles()` calls are placed in a .styles.ts file (`@griffel/styles files`)

Ensures that all makeStyles calls are placed in a .styles.ts file. The primary motivation for enabling rules is to reduce the overhead of Griffel CSS extraction build tools. With this rule enabled, your repo could be configured so the Griffel babel and webpack build tools only look at .styles.ts and .styles.js files rather than all .ts and .js files.

## Rule Details

`makeStyles()` calls should only exist inside .styles.ts files

Examples of **incorrect** code for this rule:

```js
// filename: component.tsx
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    backgroundColor: 'red',
  },
});
```

Examples of **correct** code for this rule:

```js
// filename: component.styles.ts
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    backgroundColor: 'red',
  },
});
```
