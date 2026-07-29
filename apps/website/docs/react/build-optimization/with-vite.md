---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# With Vite

:::info

`@griffel/vite-plugin` requires Vite 8 or above and `@griffel/react` 1.7.7 or above.

:::

## Install

<Tabs>
<TabItem value="yarn" label="Yarn">

```shell
yarn add --dev @griffel/vite-plugin
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev @griffel/vite-plugin
```

</TabItem>
</Tabs>

## Usage

Add the plugin to your Vite configuration:

```js
import { defineConfig } from 'vite';
import { griffel } from '@griffel/vite-plugin';

export default defineConfig({
  plugins: [griffel()],
});
```

That's it, no additional configuration is required to handle the produced CSS: the plugin relies on Vite's own CSS pipeline.

For better performance (to process less files) consider using `include`:

```js
import { defineConfig } from 'vite';
import { griffel } from '@griffel/vite-plugin';

export default defineConfig({
  plugins: [
    griffel({
      include: [/src\//, /node_modules\/@fluentui\//],
    }),
  ],
});
```

## How it works

The plugin is a pair of Vite plugins:

- a plugin with `enforce: 'pre'` evaluates `makeStyles()` & `makeResetStyles()` calls at build time and moves the produced CSS to virtual CSS modules
- a plugin with `enforce: 'post'` collects these modules during `generateBundle()`, sorts the rules into style buckets and merges them into the stylesheets of your entrypoints

## Caveats

### Development mode

The plugin applies to production builds only. A dev server has no bundling step, so there is no stylesheet to extract rules into, and Griffel handles styles in runtime there as it does without the plugin.

### Non ESM files

CSS is extracted only from ES modules. Files that are not ES modules are skipped and fall back to Griffel's runtime.

## Configuration

Please check [the README](https://github.com/microsoft/griffel/tree/main/packages/vite-plugin) of `@griffel/vite-plugin` to check how to configure module evaluation and imports.
