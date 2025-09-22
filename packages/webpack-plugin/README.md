# @griffel/webpack-plugin

A unified Webpack plugin that performs build time transforms and CSS extraction for Griffel.

This package combines the functionality of `@griffel/webpack-loader` and `@griffel/webpack-extraction-plugin` into a single, unified plugin.

## Install

```bash
yarn add --dev @griffel/webpack-plugin
# or
npm install --save-dev @griffel/webpack-plugin
```

## Usage

```js
const { GriffelPlugin } = require('@griffel/webpack-plugin');

module.exports = {
  plugins: [
    new GriffelPlugin({
      // plugin options
    })
  ]
};
```

## Development

This package is part of the Griffel monorepo and is built using the OXC toolkit to avoid Babel dependencies.