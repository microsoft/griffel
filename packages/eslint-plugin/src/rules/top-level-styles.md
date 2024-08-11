# Ensure `makeStyles`, `makeResetStyles` and `makeStaticStyles` are only called at the top-level of a file

This is an opinionated rule to discourage developers from misusing the `makeStyles`, `makeResetStyles` and `makeStaticStyles` 
methods. These methods don't allow passing runtime values for constructing the styles, as described here under [limitations](https://griffel.js.org/react/guides/). To encourage proper usage, this rule only permits calling those methods in the _top-level scope_ of a file, where it's far less likely developers will pass runtime values.

## Rule Details

Examples of **incorrect** code for this rule:

```js
// filename: component.tsx
import { makeStyles } from '@griffel/react';

export const getStyles = () => {
    const useStyles = makeStyles({
        root: {
            backgroundColor: 'red',
        },
    });

    return useStyles;
}
```

```js
// filename: component.tsx
import { makeStyles } from '@fluentui/react-components';

export class MyClass {
  getStyles () {
    const styles = makeStyles({
        root: {
            backgroundColor: 'red',
        },
    });

    return styles;
  }
}
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

```js
import { makeStyles } from '@fluentui/react-components';
import { generateStyles } from './custom-css';

export const useStyles = generateStyles(makeStyles({
  root: {
    backgroundColor: 'red',
  },
}));
```
