# @griffel/vite-plugin

The package contains a plugin for [Vite](https://vitejs.dev/).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```shell
# npm
npm i -D @griffel/tag-processor @griffel/vite-plugin
# yarn
yarn add --dev @griffel/tag-processor @griffel/vite-plugin
```

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
