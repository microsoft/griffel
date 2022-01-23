# Babel preset for Griffel

A Babel preset that performs build time transforms for [`@griffel/react`](../react).

## Install

```bash
yarn add @griffel/babel-preset
```

## Usage

`.babelrc`

```json
{
  "presets": ["@griffel/babel"]
}
```

### Importing Griffel from custom packages

```js
import { makeStyles } from 'custom-package';
// 👇 custom import names are also supported
import { createStyles } from 'custom-package';
```

By default, preset handles imports from `@griffel/react`, to handle imports from custom packages settings should be tweaked:

```json
{
  "presets": [
    [
      "@griffel/babel",
      {
        "modules": [{ "moduleSource": "custom-package", "importName": "makeStyles" }]
      }
    ]
  ]
}
```

> **Note**: "custom-package" should re-export `__styles` function from `@griffel/react`

### Configuring Babel settings

If you need to specify custom Babel configuration, you can pass them to `babelOptions`. These options will be used by the preset when parsing and evaluating modules.

```json
{
  "presets": [
    [
      "@griffel/babel",
      {
        "babelOptions": {
          "plugins": ["@babel/plugin-proposal-class-static-block"],
          "presets": ["@babel/preset-typescript"]
        }
      }
    ]
  ]
}
```

### Configuring module evaluation

```json
{
  "presets": [
    [
      "@griffel/babel",
      {
        "evaluationRules": []
      }
    ]
  ]
}
```

The set of rules that defines how the matched files will be transformed during the evaluation. `EvalRule` is an object with two fields:

- test is a regular expression or a function `(path: string) => boolean`
- action is an `Evaluator` function, "ignore" or a name of the module that exports `Evaluator` function as a **default** export

_If `test` is omitted, the rule is applicable for all the files._

The last matched rule is used for transformation. If the last matched action for a file is "ignore" the file will be evaluated as is, so that file must not contain any js code that cannot be executed in nodejs environment (it's usually true for any lib in `node_modules`).

If you need to compile certain modules under `/node_modules/` (which can be the case in monorepo projects), it's recommended to do it on a module by module basis for faster transforms, e.g. ignore: `/node_modules[\/\\](?!some-module|other-module)/`.

The default setup is:

```js
module.exports = {
  presets: [
    [
      '@griffel/babel',
      {
        evaluationRules: [
          {
            action: require('@linaria/shaker').default,
          },
          {
            test: /[/\\]node_modules[/\\]/,
            action: 'ignore',
          },
        ],
      },
    ],
  ],
};
```

## Transforms

This preset is designed to perform build time transforms for `@griffel/react`, it supports both ES modules and CommonJS thus can be used in post processing after TypeScript, for example.

Transforms applied by this preset allow stripping runtime part of `makeStyles()` and improve performance.

## Example

Transforms

```js
import { makeStyles } from '@griffel/react';

const useStyles = makeStyles({
  root: { color: 'red' },
});
```

roughly to

```js
import { __styles } from '@griffel/react';

const useStyles = __styles(/* resolved styles */);
```

## Troubleshooting

This section focuses mainly on troubleshooting this babel preset in the [microsoft/fluentui](https://github.com/microsoft/fluentui) repo.
However, the concepts are not coupled to the repo setup.

### Linaria

The preset uses tools from [linaria](https://github.com/callstack/linaria) to evaluate runtime calls of `makeStyles`.
[Linaria's debugging documentation can help here](https://github.com/callstack/linaria/blob/master/CONTRIBUTING.md#debugging-and-deep-dive-into-babel-plugin). Here are a few examples with building packages with linaria debug output.

Directly from the package

```sh
$ DEBUG=linaria\* LINARIA_LOG=debug yarn build
```

Using Lage from the root of the repo

```sh
$ DEBUG=linaria\* LINARIA_LOG=debug yarn lage build --to <package-name>
```

Using `yarn workspace` from the root of the repo

```sh
$ DEBUG=linaria\* LINARIA_LOG=debug yarn workspace <package-name> build
```

On Windows it's required to set environment variables via [`set`](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/set_1) or you can use `cross-env`, for example:

```sh
$ yarn cross-env DEBUG=linaria\* LINARIA_LOG=debug yarn workspace <package-name> build
```

The debug output will include:

- Transformed code
- Evaluated code
- AST that indicates what code has been shaken with `@linaria/shaker`
