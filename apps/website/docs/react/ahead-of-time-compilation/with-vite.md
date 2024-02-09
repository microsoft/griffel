---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# With Vite

## Install

<Tabs>
<TabItem value="yarn" label="Yarn">

```shell
yarn add --dev @griffel/tag-processor @griffel/vite-plugin
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev @griffel/tag-processor @griffel/vite-plugin
```

</TabItem>
</Tabs>

## Usage

After installation, add the plugin to your `vite.config.js`:

```js
import { defineConfig } from 'vite';
import griffel from '@griffel/vite-plugin';

export default defineConfig(({ command }) => ({
  // ...
  plugins: [
    // We recommend using the plugin only in production builds to get optimized output
    command === 'build' && griffel(),
  ],
}));
```
