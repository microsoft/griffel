---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# With Webpack

## Install

<Tabs>
<TabItem value="yarn" label="Yarn">

```shell
yarn add --dev @griffel/webpack-loader
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev @griffel/webpack-loader
```

</TabItem>
</Tabs>

## Usage

Webpack documentation: [Loaders](https://webpack.js.org/loaders/)

Within your webpack configuration object, you'll need to add the `@griffel/webpack-loader` to the list of modules, like so:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
        },
      },

      // If your project uses TypeScript
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: '@griffel/webpack-loader',
          options: {
            babelOptions: {
              presets: ['@babel/preset-typescript'],
            },
          },
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
          options: {
            babelOptions: {
              presets: ['@babel/preset-typescript'],
            },
          },
        },
      },
    ],
  },
};
```

## Usage with Next.js

Next.js allows to [tweak Webpack's config](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config) so the same options are applicanle to its config.

```js
// next.config.js

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
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
};
```

## Configuration

Please check [the README](https://github.com/microsoft/griffel/tree/main/packages/webpack-loader) of `@griffel/webpack-loader` to check how to configure module evaluation and imports.
