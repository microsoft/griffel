# Webpack plugin to perform CSS extraction in Griffel

> ⚠️ **Note** This package is experimental, API may change.

A plugin for Webpack 5 that performs CSS extraction for [`@griffel/react`](../react).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [When to use it?](#when-to-use-it)
- [How it works?](#how-it-works)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
yarn add --dev @griffel/webpack-extraction-plugin
# or
npm install --save-dev @griffel/webpack-extraction-plugin
```

## When to use it?

It's designed to be used only in applications.

## How it works?

This plugin relies on assets transformed by [`@griffel/babel-preset`](../babel-preset) or [`@griffel/webpack-loader`](../webpack-loader). Usage of these utilities is a **prerequisite**.

The plugin transforms code to remove generated CSS from JavaScript files and create CSS assets.

_Currently, all CSS rules will be extracted to a single CSS file i.e. [code splitting](https://webpack.js.org/guides/code-splitting/) for extracted CSS **will not work**._

## Usage

Webpack documentation:

- [Loaders](https://webpack.js.org/loaders/)
- [Plugins](https://webpack.js.org/concepts/plugins/)

> Please configure [`@griffel/webpack-loader`](../webpack-loader) first.

Within your Webpack configuration object, you'll need to add the loader and the plugin from `@griffel/webpack-extraction-plugin` like so:

```js
const { GriffelCSSExtractionPlugin } = require('@griffel/webpack-extraction-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        // Apply "exclude" only if your dependencies **do not use** Griffel
        // exclude: /node_modules/,
        use: {
          loader: GriffelCSSExtractionPlugin.loader,
        },
      },
      // Add "@griffel/webpack-loader" if you use Griffel directly in your project
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
        },
      },
      // "css-loader" is required to handle produced CSS assets by Griffel
      // you can use "style-loader" or "MiniCssExtractPlugin.loader" to handle CSS insertion
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin(), new GriffelCSSExtractionPlugin()],
};
```

- `mini-css-extract-plugin` is not mandatory and configured there for example, you can use `style-loader` or other tooling to inject CSS on a page

For better performance (to process less files) consider to use `include` for `GriffelCSSExtractionPlugin.loader`:

```js
const { GriffelCSSExtractionPlugin } = require('@griffel/webpack-extraction-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        include: [
          path.resolve(__dirname, 'components'),
          /\/node_modules\/@fluentui\/,
          // see https://webpack.js.org/configuration/module/#condition
        ],
        use: {
          loader: GriffelCSSExtractionPlugin.loader,
        },
      },
    ],
  },
};
```
