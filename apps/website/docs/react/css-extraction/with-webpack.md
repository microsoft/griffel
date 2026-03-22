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
yarn add --dev @griffel/webpack-plugin
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev @griffel/webpack-plugin
```

</TabItem>
</Tabs>

## Usage

Within your Webpack configuration object, you'll need to add the loader and the plugin from `@griffel/webpack-plugin` like so:

```js
const { GriffelPlugin } = require('@griffel/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
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
      // "css-loader" is required to handle produced CSS assets by Griffel
      // you can use "MiniCssExtractPlugin.loader" to handle CSS insertion
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin(), new GriffelPlugin()],
};
```

- `mini-css-extract-plugin` is not mandatory and is used as an example, you can use other tooling to inject CSS on a page

:::caution `style-loader` is not supported

`style-loader` does not produce necessary assets for the Griffel plugin to order CSS rules correctly. Using it to handle CSS insertion would result in partially broken styling in your app.

:::

For better performance (to process less files) consider using `include` for `@griffel/webpack-plugin/loader`:

```js
const { GriffelPlugin } = require('@griffel/webpack-plugin');
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
          loader: '@griffel/webpack-plugin/loader',
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
