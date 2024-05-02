---
sidebar_position: 2
---

# Limitations

## Runtime styles

Styles can't be created at runtime which includes dynamic selectors as well.

```jsx
function App(props) {
  // ❌ This will not work and throw an exception
  const useClasses = makeStyles({
    root: {
      color: props.color,
      [`.${props.area}`]: { display: 'block' },
    },
  });
}
```

As Griffel performs ahead-of-time [compilation](/react/ahead-of-time-compilation/introduction) values used in CSS rules should be static so that they can be compiled.

### Workarounds

- Enumerate variants. If you know values in advance and a set is limited the best option is to enumerate them.

  ```jsx
  const useClasses = makeStyles({
    twoColumns: {
      /* styles */
    },
    threeColumns: {
      /* styles */
    },
    fourColumns: {
      /* styles */
    },
  });

  function App(props) {
    const classes = useClasses();
    const className = mergeClasses(
      props.columns === 'two' && classes.twoColumns,
      props.columns === 'three' && classes.threeColumns,
      props.columns === 'four' && classes.fourColumns,
    );

    return <div className={className} />;
  }
  ```

- Use inline styles on elements. They don't have the best performance, but it will be faster than invoking any CSS-in-JS for frequently changing values.

  ```jsx
  const useClasses = makeStyles({
    root: {
      /* your other styles styles */
    },
  });

  function App(props) {
    const classes = useClasses();
    return <div className={classes.root} style={{ color: props.color }} />;
  }
  ```

- Use local CSS variables for nested/pseudo selectors. Prefer to use inline styles, but they can't be used for pseudo selector, for example.

  ```jsx
  const useClasses = makeStyles({
    root: {
      ':hover': { color: 'var(--my-app-color)' },
    },
  });

  function App(props) {
    const classes = useClasses();
    return <div style={{ '--my-app-color': props.color }} />;
  }
  ```

## _Some_ of CSS shorthands are not supported

The latest versions of Griffel support CSS shorthand properties, for example:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    padding: '2px 4px',
    background: 'green',
  },
});
```

**However**, some of the shorthands are not supported: `borderColor`, `borderStyle` & `borderWidth`. The reason is that they can't be combined in a reliable way with other properties, see [microsoft/griffel#531](https://github.com/microsoft/griffel/issues/531) for more information.

For these properties, we suggest to use `shorthands.*` functions to avoid writing longhand properties:

```js
import { makeStyles, shorthands } from '@griffel/react';

const useClasses = makeStyles({
  root: {
    // ❌ This is not supported, TypeScript compiler will throw, styles will not be inserted to DOM
    borderColor: 'red',
    // ✅ Use shorthand functions to avoid writing CSS longhands
    ...shorthands.borderColor('red'),
  },
});
```
