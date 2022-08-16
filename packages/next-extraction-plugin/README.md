# Next plugin to perform CSS extraction in Griffel

A plugin for NextJS 12.0.5 and newer that adds [`@griffel/webpack-extraction-plugin`](../webpack-extraction-plugin) to webpack loaders pipeline.

## Install

```bash
yarn add --dev @griffel/next-extraction-plugin
# or
npm install --save-dev @griffel/next-extraction-plugin
```

If you haven't installed yet `@griffel/webpack-loader`, please also install it:

```bash
yarn add --dev @griffel/webpack-loader
# or
npm install --save-dev @griffel/webpack-loader
```

For more details please check [README of `@griffel/webpack-loader`](../webpack-loader/README.md).

## Usage

In `next.config.js` file you'll need to add the next-plugin from `@griffel/webpack-extraction-plugin` like so:

```js
// next.config.js
const { withGriffelCSSExtraction } = require('@griffel/next-extraction-plugin');

module.exports = withGriffelCSSExtraction()({
  webpack(config) {
    config.module.rules.unshift({
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: '@griffel/webpack-loader',
        },
      ],
    });

    // If your project uses TypeScript
    config.module.rules.unshift({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: '@griffel/webpack-loader',
          options: {
            babelOptions: {
              presets: ['next/babel'],
            },
          },
        },
      ],
    });

    return config;
  },
});
```
