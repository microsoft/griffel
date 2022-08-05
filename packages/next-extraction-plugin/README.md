
# Next plugin to perform CSS extraction in Griffel

A plugin for NextJS 12.0.5 and newer that add [`@griffel/webpack-extraction-plugin`](../webpack-extraction-plugin) to webpack loaders pipeline.

## Install

```bash
yarn add --dev @griffel/next-extraction-plugin
# or
npm install --save-dev @griffel/next-extraction-plugin
```

## Usage

In `next.config.js` file you'll need to add the next-plugin from `@griffel/webpack-extraction-plugin` like so:
```js
// next.config.js
const { withGriffelCSSExtraction } = require('@griffel/webpack-extraction-plugin');

module.exports = withGriffelCssExtraction()({
  webpack(config) {
    config.module.rules.push({
      test: /\.(js|jsx|tsx|ts)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: '@griffel/webpack-loader',
        },
      ],
    });
    return config;
  },
});
```
