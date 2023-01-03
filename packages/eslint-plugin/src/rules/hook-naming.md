# Enforce that hooks from `makeStyles()` are named with a "use" prefix (`@griffel/hook-naming`)

Ensure that hooks returned by the `makeStyles()` function start with "use", so they follow [React convention](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook) and can be checked for [rules of Hooks](https://reactjs.org/docs/hooks-rules.html).

## Rule Details

`makeStyles()` is a factory that returns React hooks. Hooks should have names beginning with "use" (such as `useStyles`, not `getStyles`) to follow React convention. This also allows React lint rules to ensure hooks are called properly.

Examples of **incorrect** code for this rule:

```js
import { makeStyles } from '@griffel/react';

export const getStyles = makeStyles({
  root: {
    backgroundColor: 'red',
  },
});
```

Examples of **correct** code for this rule:

```js
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    backgroundColor: 'red',
  },
});
```
