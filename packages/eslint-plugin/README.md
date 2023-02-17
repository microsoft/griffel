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

This plugin exports recommended configuration that enforce good practices, but you can use only uses that are required for your use case:

```json
{
  "plugins": ["@griffel"],
  "rules": {
    "@griffel/hook-naming": "error",
    "@griffel/no-shorthands": "warn"
  }
}
```

You can find more info about enabled rules in the [Supported Rules section](#supported-rules) below.

## Supported Rules

**Key**: 🔧 = fixable

| Name                                                     | Description                                                                | 🔧  |
| -------------------------------------------------------- | -------------------------------------------------------------------------- | --- |
| [`@griffel/hook-naming`](./src/rules/hook-naming.md)     | Ensure that hooks returned by the `makeStyles()` function start with "use" |     |
| [`@griffel/no-shorthands`](./src/rules/no-shorthands.md) | Enforce usage of CSS longhands                                             |     |
