---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# With Next.js

## Install

<Tabs>
<TabItem value="yarn" label="Yarn">

```shell
yarn add --dev @griffel/next-extraction-plugin
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev @griffel/next-extraction-plugin
```

</TabItem>
</Tabs>

## Usage

:::info

Please configure [`@griffel/webpack-loader`](/react/ahead-of-time-compilation/with-webpack) first.

:::

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
