# ESLint plugin for Griffel

ESLint plugin to follow best practices and anticipate common mistakes when writing styles with Griffel

## Install

```bash
yarn add --dev @griffel/eslint-plugin
# or
npm install --save-dev @griffel/eslint-plugin
```

## Usage

Add `@griffel/eslint-plugin` to the extends section of your `.eslintrc` configuration file:

```json
{
  "extends": ["@griffel"]
}
```

## Shareable configurations

This plugin exports recommended configuration that enforce good practices, but you can use only uses that are required for your use case:

```json
{
  "plugins": ["@griffel"],
  "rules": {
    "@griffel/no-shorthands": "warn"
  }
}
```

You can find more info about enabled rules in the [Supported Rules section](#supported-rules) below.

## Supported Rules

**Key**: 🔧 = fixable

| Name                                                     | Description                    | 🔧  |
| -------------------------------------------------------- | ------------------------------ | --- |
| [`@griffel/no-shorthands`](./src/rules/no-shorthands.md) | Enforce usage of CSS longhands |     |
