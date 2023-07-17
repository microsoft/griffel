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
yarn add --dev @griffel/webpack-extraction-plugin
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev @griffel/webpack-extraction-plugin
```

</TabItem>
</Tabs>

## Usage

:::info

Please configure [`@griffel/webpack-loader`](/react/ahead-of-time-compilation/with-webpack) first.

:::

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
          options: {
            babelOptions: {
              presets: ['@babel/preset-typescript'],
            },
          },
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

- `mini-css-extract-plugin` is not mandatory and is used as am example, you can use `style-loader` or other tooling to inject CSS on a page

For better performance (to process less files) consider using `include` for `GriffelCSSExtractionPlugin.loader`:

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

### `ignoreOrder` option

If you use `mini-css-extract-plugin`, you may need to set it to `false` to remove warnings about conflicting order of CSS modules:

```
WARNING in chunk griffel [mini-css-extract-plugin]
Conflicting order. Following module has been added:
* css ./node_modules/css-loader/dist/cjs.js!./node_modules/@griffel/webpack-extraction-plugin/virtual-loader/index.js?style=%2F**%20%40griffel%3Acss-start%20%5Bd%5D%20**%2F%0A.fm40iov%7Bcolor%3A%23ccc%3B%7D%0A%2F**%20%40griffel%3Acss-end%20**%2F%0A!./src/foo-module/baz.js
  despite it was not able to fulfill desired ordering with these modules:
* css ./node_modules/css-loader/dist/cjs.js!./node_modules/@griffel/webpack-extraction-plugin/virtual-loader/index.js?style=%2F**%20%40griffel%3Acss-start%20%5Bd%5D%20**%2F%0A.f1e30ogq%7Bcolor%3Ablueviolet%3B%7D%0A%2F**%20%40griffel%3Acss-end%20**%2F%0A!./src/foo-module/qux.js
  - couldn't fulfill desired order of chunk group(s)
```

This will not affect the order of CSS modules in the final bundle as Griffel sorts own CSS modules anyway.

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      ignoreOrder: true,
    }),
  ],
};
```
