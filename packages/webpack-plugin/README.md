# Webpack plugin to perform CSS extraction in Griffel

A plugin for Webpack 5 that performs CSS extraction for [`@griffel/react`](../react).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [When to use it?](#when-to-use-it)
- [Usage](#usage)
- [Options](#options)

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
- Sorts CSS rules by specificity buckets and media queries

## Options

```js
new GriffelPlugin({
  // Compare function for sorting media queries (default: @griffel/core's defaultCompareMediaQueries)
  compareMediaQueries: myCompareFunction,

  // Override the resolver used to resolve imports inside evaluated modules
  resolverFactory: myResolverFactory,

  // Attach extracted CSS to a specific entry point chunk
  unstable_attachToEntryPoint: 'main',

  // Collect and log timing stats
  collectStats: false,
});
```
