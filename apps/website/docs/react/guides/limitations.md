---
sidebar_position: 2
---

# Limitations

## Runtime styles

Styles can't be created at runtime which includes dynamic selectors as well.

```jsx
function App(props) {
  // ❌ This will not work and throw an expection
  const useClasses = makeStyles({
    color: props.color,
    [`.${props.area}`]: { display: 'block' },
  });
}
```

As Griffel performs ahead-of-time [compilation](/react/ahead-of-time-compilation/introduction) values used in CSS rules should be static to be compiled.

### Workarounds

- Use inline styles on elements. They don't have the best performance, but it will be faster than invoke any CSS-in-JS for frequently changing values.

  ```jsx
  const useClasses = makeStyles({
    /* your styles */
  });

  function App(props) {
    const classes = useClasses();
    return <div style={{ color: props.color }} />;
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

## CSS shorthands are not supported

There are [shorthand and longhand properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties) in CSS. Shorthand properties allow to define a set of longhand properties. For example:

```css
/* Define with multiple properties */
.longhand-rule {
  padding-top: 2px;
  padding-right: 4px;
  padding-bottom: 8px;
  padding-left: 16px;
}

/* Define with a single property */
.shorthand-rule {
  padding: 2px 4px 8px 16px;
}
```

Griffel relies on [Atomic CSS](/react/guides/atomic-css) and produces atomic classes:

```css
/* 💡 makeStyles() generates hashed classes, but it's not important in this example */
.a {
  background-color: red;
}
.b {
  background-color: green;
}
.c {
  color: yellow;
}
```

```html
<!-- Case 1: ❌ Wrong usage -->
<div class="a b c">Hello world!</div>
<!-- Case 2: ✅ Correct usage -->
<div class="a c">Hello world!</div>
<div class="b c">Hello world!</div>
```

- In "Case 1" both classes are applied to an element: it's wrong as result is **nondeterministic** and depends on classes order in CSS definitions (i.e. [order of appearance](https://www.w3.org/TR/css-cascade-3/#cascade-order)), [demo on CodeSandbox](https://codesandbox.io/s/css-insertion-order-matters-mgt6y)
- In "Case 2" only single classname per CSS property is applied, result will be deterministic

This problem is solved by [`mergeClasses()`](https://github.com/microsoft/griffel/blob/main/packages/core/src/mergeClasses.ts) function: it de-duplicates classes based on property name.

```jsx
// ⚠ Simplified example
function App() {
  //                     👇 skips "a", returns only "b c"
  return <div className={mergeClasses('a', 'b', 'c')}>Hello world</div>;
}
```

> Only non colliding properties should be applied to DOM elements with Atomic CSS.

This works well for longhands, but there are cases when longhands and shorthands are combined:

```js
// ⚠ Not real code
const useClasses1 = makeStyles({
  root: {
    backgroundColor: 'red',
    background: 'green',
  },
});
const useClasses2 = makeStyles({
  root: {
    background: 'green',
    backgroundColor: 'red',
  },
});
```

:::caution

In this example the problem is the same: both classes will be applied, result depends on the order of appearance.

:::

There is an option to expand CSS shorthands to longhands, but it's not reliable and does not work with static rules i.e. you can't expand rules with CSS variables without knowing their value. The single predictable solution is to disallow the usage of CSS shorthands.

You can get more information on the original RFC, [microsoft/fluentui#20573](https://github.com/microsoft/fluentui/pull/20573). For this reason Griffel disallows CSS shorthand properties in the input style object. Instead of shorthand properties, use [shorthands helper functions](/react/api/shorthands) which do the shorthand to longhand expansion statically.
