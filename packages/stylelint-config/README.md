# Standard Stylelint config for Griffel

This is a a standard [stylelint](https://stylelint.io/) that can be used to lint Griffel CSS in JS.
It uses the [Griffel postcss syntax](https://github.com/microsoft/griffel/tree/main/packages/postcss-syntax) as
a base config for any stylelint integration.

## Usage

Simply extend this configuration in your stylelint config

```json
{
  "extends": "@griffe/stylelint-config",
  "rules": {
    "alpha-value-notation": "number"
  }
}
```

## Different module source or imports

If you are using a different module source or import name like the below example:

```ts
import { foo /* makeStyles */ } from '@foo/foo'; /* @griffel/react */

export const useStyles = foo({
  root: {
    color: 'red',
  },
});
```

There is no way to customize postcss custom syntaxes, so the only way to make linting these CSS in JS files
possible is to create the griffel postcss custom syntax from a factory that can be configured. For this to work
you'll need to use a javascript stylelint config `.stylelintrc.js`

```js
module.exports {
  customSyntax: require('@griffel/postcss-syntax').createSyntax({ modules: [{ moduleSource: '@foo/foo', importName: 'foo' }] }),
  rules: {
    "alpha-value-notation": "number"
  }
}
```
