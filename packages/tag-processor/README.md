# Griffel processor for wyw-in-js

A processor for [wyw-in-js](https://github.com/Anber/wyw-in-js) for that performs build time transforms for `makeStyles` & `makeResetStyles` [`@griffel/react`](../react).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [How to use it?](#how-to-use-it)
  - [Handling Griffel re-exports](#handling-griffel-re-exports)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
yarn add --dev @griffel/tag-processor
# or
npm install --save-dev @griffel/tag-processor
```

## How to use it?

This package cannot be used solely, it should be paired with `@griffel/babel-preset` or `@griffel/webpack-loader`

- For library developers, please use [`@griffel/babel-preset`](../babel-preset)
- For application developers, please use [`@griffel/webpack-loader`](../webpack-loader)

### Handling Griffel re-exports

```js
import { makeStyles, makeResetStyles } from 'custom-package';
```

By default, the processor handles imports from `@griffel/react` & `@fluentui/react-components`, to handle imports from custom packages settings you need to include meta information to a matching `package.json`:

```json
{
  "name": "custom-package",
  "version": "1.0.0",
  "wyw-in-js": {
    "tags": {
      "makeStyles": "@griffel/tag-processor/make-styles",
      "makeResetStyles": "@griffel/tag-processor/make-reset-styles"
    }
  }
}
```

> **Note**: "custom-package" should re-export following functions from `@griffel/react`:
>
> - `__styles`
> - `__css`
> - `__resetStyles`
> - `__resetCSS`
