# Webpack plugin to perform CSS extraction in Griffel

A plugin for Webpack 5 and [Rspack](https://rspack.rs/) that performs CSS extraction for [`@griffel/react`](../react).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [When to use it?](#when-to-use-it)
- [Usage](#usage)
  - [Usage with Rspack](#usage-with-rspack)
  - [Usage with Rsbuild](#usage-with-rsbuild)
  - [Performance](#performance)
  - [`ignoreOrder` option](#ignoreorder-option)
- [Options](#options)
  - [Plugin options](#plugin-options)
  - [Loader options](#loader-options)
    - [`importsToTransform`](#importstotransform)
    - [`functionsToTransform`](#functionstotransform)
    - [`classNameHashSalt`](#classnamehashsalt)
    - [`evaluationRules`](#evaluationrules)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
yarn add --dev @griffel/webpack-plugin
# or
npm install --save-dev @griffel/webpack-plugin
```

## When to use it?

This is a replacement for `@griffel/webpack-loader` + `@griffel/webpack-extraction-plugin`. It combines both into a single plugin that handles CSS extraction without needing a separate loader setup.

## Usage

Webpack documentation:

- [Plugins](https://webpack.js.org/concepts/plugins/)
- [Loaders](https://webpack.js.org/loaders/)

Within your Webpack configuration, add the plugin along with `mini-css-extract-plugin`:

```js
import { GriffelPlugin } from '@griffel/webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        // Apply "exclude" only if your dependencies **do not use** Griffel
        // exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-plugin/loader',
        },
      },
      // "css-loader" and "mini-css-extract-plugin" are required to handle CSS assets produced by Griffel
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin(), new GriffelPlugin()],
};
```

The plugin automatically:

- Transforms `makeStyles()`, `makeResetStyles()`, and `makeStaticStyles()` calls at build time
- Extracts CSS into a dedicated chunk (named `griffel`) via `mini-css-extract-plugin`
- Sorts CSS rules by specificity buckets, media queries, and container queries

> ⚠️ **`style-loader` is not supported.** It does not produce the assets that the plugin needs to order CSS rules, using it would result in partially broken styling in your app.

### Usage with Rspack

The same plugin and loader work with [Rspack](https://rspack.rs/). Rspack has built-in CSS support, so `mini-css-extract-plugin` is not needed:

```js
const { GriffelPlugin } = require('@griffel/webpack-plugin');

module.exports = {
  mode: 'production',
  experiments: {
    css: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: [{ loader: '@griffel/webpack-plugin/loader' }],
      },
      // Required so that CSS assets produced by Griffel are handled by Rspack's native CSS support
      {
        test: /\.css$/,
        type: 'css',
      },
    ],
  },
  plugins: [new GriffelPlugin()],
};
```

Alternatively, [`CssExtractRspackPlugin`](https://rspack.rs/plugins/rspack/css-extract-rspack-plugin) can be used together with `css-loader` instead of `experiments.css`.

Rspack specifics:

- `optimization.splitChunks` **must be enabled**, the plugin throws otherwise. It is enabled by default in `production` mode.
- The `unstable_attachToEntryPoint` option is not supported and throws.

### Usage with Rsbuild

[Rsbuild](https://rsbuild.rs/) is built on top of Rspack, the plugin and the loader are added via [`tools.rspack`](https://rsbuild.rs/config/tools/rspack):

```js
import { defineConfig } from '@rsbuild/core';
import { GriffelPlugin } from '@griffel/webpack-plugin';

export default defineConfig({
  tools: {
    // 👇 required, see the caution below
    lightningcssLoader: false,
    rspack: {
      module: {
        rules: [
          {
            test: /\.(js|ts|tsx)$/,
            exclude: /node_modules/,
            use: [{ loader: '@griffel/webpack-plugin/loader' }],
          },
        ],
      },
      plugins: [new GriffelPlugin()],
    },
  },
});
```

Rsbuild already enables Rspack's native CSS support and `optimization.splitChunks`, no extra configuration is required for them.

> ⚠️ **`tools.lightningcssLoader` must be disabled.** The plugin annotates extracted CSS with `/** @griffel:css-start */` comments and relies on them to sort rules into style buckets. Rsbuild enables [`builtin:lightningcss-loader`](https://rsbuild.rs/config/tools/lightningcss-loader) by default, which strips comments. Without them CSS is emitted in module order, so, for example, `makeResetStyles()` output ends up after `makeStyles()` output and overrides it. The plugin emits a build warning when it detects this.

Disabling `tools.lightningcssLoader` also disables automatic vendor prefixing, use [`postcss`](https://rsbuild.rs/config/tools/postcss) with `autoprefixer` if you need it. CSS minification is unaffected as it runs after the rules are sorted.

### Performance

For better performance (to process less files) consider using `include` for the loader:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        include: [
          path.resolve(__dirname, 'components'),
          /\/node_modules\/@fluentui\//,
          // see https://webpack.js.org/configuration/module/#condition
        ],
        use: {
          loader: '@griffel/webpack-plugin/loader',
        },
      },
    ],
  },
};
```

### `ignoreOrder` option

If you use `mini-css-extract-plugin`, you may need to set `ignoreOrder` to `true` to remove warnings about conflicting order of CSS modules:

```
WARNING in chunk griffel [mini-css-extract-plugin]
Conflicting order. Following module has been added:
  - couldn't fulfill desired order of chunk group(s)
```

This will not affect the order of CSS modules in the final bundle as Griffel sorts own CSS modules anyway.

```js
module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      ignoreOrder: true,
    }),
  ],
};
```

## Options

### Plugin options

```js
new GriffelPlugin({
  // Compare function for sorting media queries (default: @griffel/core's defaultCompareMediaQueries)
  compareMediaQueries: myCompareFunction,

  // Compare function for sorting container queries (default: same comparator as compareMediaQueries)
  compareContainerQueries: myCompareFunction,

  // Override the resolver used to resolve imports inside evaluated modules
  resolverFactory: myResolverFactory,

  // Attach extracted CSS to a specific entry point chunk, not supported by Rspack
  unstable_attachToEntryPoint: 'main',

  // Collect and log timing stats
  collectStats: false,

  // Collect performance issues (CJS modules, barrel re-exports) found during evaluation,
  // reported via "collectStats" output
  collectPerfIssues: false,
});
```

### Loader options

#### `importsToTransform`

Defines the set of modules whose Griffel imports are transformed.

```js
// Default value
['@griffel/core', '@griffel/react', '@fluentui/react-components'];
```

Use it to handle re-exports of Griffel from custom packages:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: '@griffel/webpack-plugin/loader',
          options: {
            importsToTransform: ['@griffel/react', 'custom-package'],
          },
        },
      },
    ],
  },
};
```

> **Note**: the import source is preserved during the transform, so "custom-package" should also re-export the following functions from `@griffel/react`:
>
> - `__css`
> - `__resetCSS`
> - `__staticCSS`

#### `functionsToTransform`

Defines which Griffel style functions are transformed, can be used to narrow the default set.

```js
// Default value
['makeStyles', 'makeResetStyles', 'makeStaticStyles'];
```

#### `classNameHashSalt`

A salt that is added to generated class name hashes. Useful to avoid class name collisions when multiple independent Griffel builds are rendered on the same page.

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: '@griffel/webpack-plugin/loader',
          options: {
            classNameHashSalt: 'my-app',
          },
        },
      },
    ],
  },
};
```

#### `evaluationRules`

The set of rules that defines how the matched files will be transformed during the evaluation. `EvalRule` is an object with two fields:

- `test` is a regular expression or a function `(path: string) => boolean`
- `action` is an `Evaluator` function, `"ignore"` or a name of the module that exports an `Evaluator` function as a **default** export

_If `test` is omitted, the rule is applicable for all the files._

The last matched rule is used for transformation. If the last matched action for a file is `"ignore"` the file will be evaluated as is, so that file must not contain any code that cannot be executed in a Node.js environment.

```js
const { shakerEvaluator } = require('@griffel/babel-preset');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: '@griffel/webpack-plugin/loader',
          options: {
            // Default value
            evaluationRules: [{ action: shakerEvaluator }],
          },
        },
      },
    ],
  },
};
```

If you need to skip compilation for some modules under `/node_modules/`, it's recommended to do it on a module by module basis for faster transforms:

```js
evaluationRules: [
  { action: shakerEvaluator },
  { test: /[/\\]node_modules[/\\](?!some-module|other-module)/, action: 'ignore' },
];
```
