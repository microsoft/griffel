# ESLint plugin for Griffel

ESLint plugin to follow best practices and anticipate common mistakes when writing styles with Griffel

## Install

```bash
yarn add --dev @griffel/eslint-plugin
# or
npm install --save-dev @griffel/eslint-plugin
```

## Usage

Add `@griffel` to the plugins section and `plugin:@griffel/recommended` to the extends section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["@griffel"],
  "extends": ["plugin:@griffel/recommended"]
}
```

## Shareable configurations

This plugin exports recommended configuration that enforce good practices, but you can choose to use only the ones that are necessary for your use case:

```json
{
  "plugins": ["@griffel"],
  "rules": {
    "@griffel/hook-naming": "error",
    "@griffel/no-shorthands": "error",
    "@griffel/pseudo-element-naming": "error"
  }
}
```

You can find more info about enabled rules in the [Supported Rules section](#supported-rules) below.

## Supported Rules

**Key**: 🔧 = fixable

| Name                                                                                       | Description                                                                                                     | 🔧  |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --- |
| [`@griffel/hook-naming`](./src/rules/hook-naming.md)                                       | Ensure that hooks returned by the `makeStyles()` function start with "use"                                      | ❌  |
| [`@griffel/no-invalid-shorthand-arguments`](./src/rules/no-invalid-shorthand-arguments.md) | All shorthands must not use space separators, and instead pass in multiple arguments                            | ✅  |
| [`@griffel/no-shorthands`](./src/rules/no-shorthands.md)                                   | Enforce usage of CSS longhands                                                                                  | ✅  |
| [`@griffel/styles-file`](./src/rules/styles-file.md)                                       | Ensures that all `makeStyles()` and `makeResetStyles()` calls are placed in a `.styles.js` or `.styles.ts` file | ❌  | limitations) | ❌ |
| [`@griffel/pseudo-element-naming`](./src/rules/pseudo-element-naming.md)                   | Ensures that all Pseudo Elements start with two colons                                                          | ✅  |
| [`@griffel/top-level-styles`](./src/rules/top-level-styles.md)                    | Ensures that all `makeStyles()`, `makeResetStyles()` and `makeStaticStyles()` calls are written in the top level of a file to discourage developer misuse.  | ❌  |
| [`@griffel/no-deprecated-shorthands`](./src/rules/no-deprecated-shorthands.md)                                       | Ensure that deprecated shorthand functions are not used                                      | ❌
