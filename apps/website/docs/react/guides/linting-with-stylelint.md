---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linting with stylelint

Griffel compiles `makeStyles()` and `makeResetStyles()` calls to atomic CSS ahead of time. That CSS is
never written to a `.css` file, so a CSS linter has nothing to read and mistakes like an unmatchable
selector stay unnoticed until runtime.

[`@griffel/postcss-syntax`](https://github.com/microsoft/griffel/tree/main/packages/postcss-syntax) is a
PostCSS [custom syntax](https://postcss.org/docs/how-to-write-custom-syntax) that runs the Griffel
transform over your style files and hands the generated CSS to [stylelint](https://stylelint.io/), with
source locations pointing back to the original TypeScript.

## Install

<Tabs>
<TabItem value="yarn" label="Yarn">

```shell
yarn add --dev stylelint @griffel/postcss-syntax
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev stylelint @griffel/postcss-syntax
```

</TabItem>
</Tabs>

## Setup

Point stylelint's `customSyntax` at the package:

```json title=".stylelintrc.json"
{
  "customSyntax": "@griffel/postcss-syntax",
  "rules": {
    "selector-anb-no-unmatchable": true
  }
}
```

Then lint your style files:

```shell
npx stylelint "src/**/*.styles.ts"
```

:::caution

`@griffel/postcss-syntax` is ESM only. If your project is CommonJS, use `stylelint.config.mjs` instead
of `.stylelintrc.js`, as the latter is loaded with `require()`.

:::

## Example

```ts title="example.styles.ts"
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ':nth-child(0)': { color: 'red' },
  },
});
```

`:nth-child(0)` matches nothing, so stylelint reports `selector-anb-no-unmatchable` and points at the
`root` slot in `example.styles.ts` rather than at generated CSS.

## Disabling rules

`stylelint-disable` comments cannot be placed in generated CSS. Use a `griffel-csslint-disable` line
comment above a slot instead:

```ts
export const useStyles = makeStyles({
  // griffel-csslint-disable selector-anb-no-unmatchable
  root: {
    ':nth-child(0)': { color: 'red' },
  },
});
```

For `makeResetStyles()` place the directive above the declaration:

```ts
// griffel-csslint-disable selector-anb-no-unmatchable
export const useResetStyles = makeResetStyles({
  ':nth-child(0)': { color: 'red' },
});
```

Each directive disables exactly one rule, repeat the comment to disable several.

## Linting custom wrappers

By default only imports from `@griffel/core`, `@griffel/react` and `@fluentui/react-components` are
processed. If your project re-exports Griffel from its own package, build a configured syntax with
`createSyntax()`:

```js title="stylelint.config.mjs"
import { createSyntax } from '@griffel/postcss-syntax';

export default {
  customSyntax: createSyntax({
    importsToTransform: ['@griffel/react', '@myScope/griffel'],
  }),
  rules: {
    'selector-anb-no-unmatchable': true,
  },
};
```

:::caution

`importsToTransform` replaces the default list rather than extending it, keep `@griffel/react` in it if
you also import from it directly.

:::

## Limitations

- Styles must be statically evaluable, see [Limitations](./limitations.md).
- stylelint's `--fix` is not supported, as generated CSS cannot be mapped back to the original
  JavaScript accurately enough to rewrite it.
