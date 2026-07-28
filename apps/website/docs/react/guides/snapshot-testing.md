---
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Snapshot testing

Griffel generates atomic class names by hashing style declarations, so a component renders as:

```html
<div class="static-class ___1t65jhk_nkb4zh0 fe3e8s9 frdkuqy"></div>
```

These hashes are an implementation detail. Changing an unrelated style, upgrading Griffel or
reordering declarations can change them, and every snapshot that captured them has to be updated even
though the rendered result is identical.

[`@griffel/jest-serializer`](https://github.com/microsoft/griffel/tree/main/packages/jest-serializer)
is a snapshot serializer that removes the generated class names, so snapshots only contain markup you
actually wrote:

```html
<div class="static-class"></div>
```

## Install

<Tabs>
<TabItem value="yarn" label="Yarn">

```shell
yarn add --dev @griffel/jest-serializer
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev @griffel/jest-serializer
```

</TabItem>
</Tabs>

## Setup

Despite the name, the package works with both Jest and Vitest.

<Tabs>
<TabItem value="jest" label="Jest">

```js title="jest.config.js"
module.exports = {
  snapshotSerializers: ['@griffel/jest-serializer'],
};
```

</TabItem>
<TabItem value="vitest" label="Vitest">

```ts title="vitest.config.ts"
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    snapshotSerializers: ['@griffel/jest-serializer'],
  },
});
```

Alternatively, register it from a setup file:

```ts title="vitest.setup.ts"
import { expect } from 'vitest';
import { print, test } from '@griffel/jest-serializer';

expect.addSnapshotSerializer({ print, test });
```

</TabItem>
</Tabs>

Classes from `makeStyles()` and `makeResetStyles()` are both removed, any other class name is kept:

```jsx
const useStyles = makeStyles({ root: { color: 'red', paddingLeft: '10px' } });
const useResetStyles = makeResetStyles({ marginLeft: '20px' });

function Component() {
  const classes = useStyles();
  const resetClassName = useResetStyles();

  return <div data-testid="element" className={mergeClasses('static-class', resetClassName, classes.root)} />;
}
```

```html
<div data-testid="element" class="static-class"></div>
```

## Asserting styles

Because the serializer removes the class names, a snapshot no longer tells you which styles were
applied. Assert the applied styles directly instead, with
[`toHaveStyle()`](https://github.com/testing-library/jest-dom#tohavestyle) from
`@testing-library/jest-dom`:

```jsx
render(<Component />);

expect(screen.getByTestId('element')).toHaveStyle({
  color: 'rgb(255, 0, 0)',
  paddingLeft: '10px',
  marginLeft: '20px',
});
```

This reads the computed styles from the document, so it covers everything Griffel applied, including
[shorthands](../api/shorthands.md), RTL flipping and overrides from
[`mergeClasses()`](../api/merge-classes.md).

Static class names are untouched by the serializer, so they can still be asserted:

```jsx
expect(screen.getByTestId('element')).toHaveClass('static-class');
```

:::tip

Use snapshots for structure and `toHaveStyle()` for styling. A snapshot that contains generated class
names will churn on every unrelated style change, while `toHaveStyle()` describes the intent of the
test.

:::

## Slot names in snapshots

The serializer cannot print slot names (`root`, `primary`, ...) instead of the generated ones, because
a class name does not identify a slot. Identical styles produce identical classes regardless of which
`makeStyles()` call or slot they came from:

```js
const useClassesA = makeStyles({ rootA: { color: 'red', paddingTop: '10px' } });
const useClassesB = makeStyles({ rootB: { color: 'red', paddingTop: '10px' } });
```

Both `useClassesA().rootA` and `useClassesB().rootB` return the same string, so there is nothing to map
back to `rootA` or `rootB`.

If you still want slot names in snapshots, mock `@griffel/react` so that each slot returns its own
name. This replaces Griffel's runtime, so no styles are applied and `toHaveStyle()` will not work:

<Tabs>
<TabItem value="jest" label="Jest">

```js
jest.mock('@griffel/react', () => {
  const actual = jest.requireActual('@griffel/react');

  return {
    ...actual,
    makeStyles: stylesBySlots => () =>
      Object.fromEntries(Object.keys(stylesBySlots).map(slotName => [slotName, slotName])),
    mergeClasses: (...classNames) => classNames.filter(Boolean).join(' '),
  };
});
```

</TabItem>
<TabItem value="vitest" label="Vitest">

```ts
vi.mock('@griffel/react', async importActual => {
  const actual = await importActual<typeof import('@griffel/react')>();

  return {
    ...actual,
    makeStyles: (stylesBySlots: Record<string, unknown>) => () =>
      Object.fromEntries(Object.keys(stylesBySlots).map(slotName => [slotName, slotName])),
    mergeClasses: (...classNames: unknown[]) => classNames.filter(Boolean).join(' '),
  };
});
```

</TabItem>
</Tabs>

```jsx
function Component(props) {
  const classes = useStyles();

  return <div className={mergeClasses(classes.root, props.primary && classes.primary)} />;
}
```

```html
<div class="root primary"></div>
```

The mock can also be registered globally, see
[manual mocks](https://jestjs.io/docs/manual-mocks#mocking-user-modules).

:::note

If you want the generated class names in your snapshots, simply do not add the serializer.

:::
