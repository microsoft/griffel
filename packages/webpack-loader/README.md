# Webpack loader for Griffel

A loader for Webpack 5 that performs build time transforms for [`@griffel/react`](../react).

## Install

```bash
yarn add --dev @griffel/webpack-loader
# or
npm install --save-dev @griffel/webpack-loader
```

## When to use it?

- For library developers, please use [`@griffel/babel-preset`](../babel-preset)
- For application developers, please use Webpack loader (this package)

## Usage

Webpack documentation: [Loaders](https://webpack.js.org/loaders/)

Within your webpack configuration object, you'll need to add the `@griffel/webpack-loader` to the list of modules, like so:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
        },
      },
    ],
  },
};
```

While the loader itself has a short circuit to avoid processing (invoking Babel transforms) it's better to reduce the scope of processed files. For example, you can enforce a restriction to have `makeStyles()` calls only in `.styles.ts` files:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.styles.ts$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
        },
      },
    ],
  },
};
```

### Handling Griffel re-exports

```js
import { makeStyles } from 'custom-package';
// 👇 custom import names are also supported
import { createStyles } from 'custom-package';
```

By default, the Webpack loader handles imports from `@griffel/react`. The webpack loader can be re-configured to handle re-exports of Griffel from custom packages. The `makeStyles` function itself can also be renamed in this case.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
          options: {
            modules: [{ moduleSource: 'custom-package', importName: 'makeStyles' }],
          },
        },
      },
    ],
  },
};
```

> **Note**: "custom-package" should re-export `__styles` function from `@griffel/react`

### Configuring Babel settings

If you need to specify custom Babel configuration, you can pass them to `babelOptions`. These options will be used by the Webpack loader when parsing and evaluating modules.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
          options: {
            babelOptions: {
              plugins: ['@babel/plugin-proposal-class-static-block'],
              presets: ['@babel/preset-typescript'],
            },
          },
        },
      },
    ],
  },
};
```

### Configuring module evaluation

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
          options: {
            evaluationRules: [],
          },
        },
      },
    ],
  },
};
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
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
          options: {
            evaluationRules: [
              {
                action: require('@griffel/babel-preset').shakerEvaluator,
              },
              {
                test: /[/\\]node_modules[/\\]/,
                action: 'ignore',
              },
            ],
          },
        },
      },
    ],
  },
};
```

## Troubleshooting

Under hood `@griffel/webpack-loader` uses [`@griffel/babel-preset`](../babel-preset), please check "Troubleshooting" there.
