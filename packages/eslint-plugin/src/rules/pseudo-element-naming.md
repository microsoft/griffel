# Enforce that Pseudo elements start with two colons

Ensures that all Pseudo Elements start with two colons (`::before`) instead of one colon (`:before`).

## Rule Details

Pseudo **Elements** should always start with two colons while Pseudeo **Selectors** should always start with one colon.

Examples of **incorrect** code for this rule:

```js
import { makeStyles } from '@griffel/react';

export const makeStyles({
  root: {
    ':before': {},
    ':after': {},
  },
});
```

Examples of **correct** code for this rule:

```js
import { makeStyles } from '@griffel/react';

export const makeStyles({
  root: {
    '::before': {},
    '::after': {},
  },
});
```
