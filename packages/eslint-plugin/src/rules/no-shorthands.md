# Enforce usage of CSS longhands (`@griffel/no-shorthands`)

Ensure that rules passed to `makeStyles()` function do not contain [CSS shorthands](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties).

## Rule Details

The latest versions of Griffel supports CSS shorthand properties. However, some of the shorthands are not supported: `borderColor`, `borderStyle` & `borderWidth`.

Unsupported CSS shorthands are enforced by typings, but there are cases when they don't work as expected [microsoft/griffel#78](https://github.com/microsoft/griffel/issues/78).

Examples of **incorrect** code for this rule:

```js
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    background: 'red',
    padding: '10px 20px',
  },
});
```

Examples of **correct** code for this rule:

```js
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    backgroundColor: 'red',
    ...shorthands.padding('10px', '20px'),
  },
});
```
