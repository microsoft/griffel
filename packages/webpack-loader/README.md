# Webpack loader for Griffel

A loader for Webpack 5 that performs build time transforms for [`@griffel/react`](../react).

## Install

```bash
yarn add --dev @griffel/webpack-loader
# or
npm install --dev @griffel/webpack-loader
```

## Usage

Webpack documentation: [Loaders](https://webpack.js.org/loaders/)

Within your webpack configuration object, you'll need to add the `@griffel/webpack-loader` to the list of modules, like so:

```javascript
module: {
  rules: [
    {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: '@griffel/webpack-loader',
      },
    },
  ];
}
```

## Troubleshooting

Under hood `@griffel/webpack-loader` uses [`@griffel/babel-preset`](../babel-preset), please check "Troubleshooting" there.
