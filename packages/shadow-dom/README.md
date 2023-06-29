# Griffel for Shadow DOM

A package with wrappers and APIs to be used with Shadow DOM.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [`createShadowDOMRenderer()`](#createshadowdomrenderer)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
npm install @griffel/shadow-dom
# or
yarn add @griffel/shadow-dom
```

## `createShadowDOMRenderer()`

```ts
import { createShadowDOMRenderer } from '@griffel/shadow-dom';

const render = createShadowDOMRenderer(element.shadowRoot);
```
