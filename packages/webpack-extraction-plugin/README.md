# Webpack plugin to perform CSS extraction in Griffel

> ⚠️ **Note** This package is experimental, API may change.

A plugin for Webpack 5 that performs CSS extraction for [`@griffel/react`](../react).

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
      // ".css" configured there for example, but "css-loader" is required to handle produces CSS assets
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin(), new GriffelCSSExtractionPlugin()],
};
```

- Usage `mini-css-extract-plugin` is not required
