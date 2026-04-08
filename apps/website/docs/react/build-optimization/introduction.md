---
sidebar_position: 1
---

# Introduction

While there is nothing wrong with the associated runtime costs of a CSS-in-JS engine, larger and more complex applications might want to optimize for performance.

Griffel only does the expensive runtime on the first render of a component. This work can be further optimized at build time using a bundler plugin, which performs two optimizations in a single pass:

- **Ahead-of-time compilation** — pre-computes and transforms styles at build time, replacing the runtime `makeStyles` with a lightweight function that simply concatenates CSS classes
- **CSS extraction** — removes generated CSS from JavaScript bundles and produces CSS stylesheets, eliminating runtime insertion into the DOM

## When to use it?

It's designed to be used **only** in applications. It is reasonable to introduce build time optimization if/when it is required.

## What to use?

- [Webpack / Rspack plugin](/react/build-optimization/with-webpack)
