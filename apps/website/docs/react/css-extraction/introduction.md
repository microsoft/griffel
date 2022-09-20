---
sidebar_position: 1
---

# Introduction

:::caution

This technology is experimental, please [report issues](https://github.com/microsoft/griffel/issues) if you will face them.

:::

While [ahead-of-time compilation allows](/react/ahead-of-time-compilation/introduction) performs optimization to reduce runtime parts, the goal of CSS extraction is remove runtime insertion to DOM and produce CSS stylesheets.

## When to use it?

It's designed to be used **only** in applications.

## How it works?

The tool relies on assets transformed by [ahead-of-time compilation](/react/ahead-of-time-compilation/introduction), its usage is a **prerequisite**. CSS extraction transforms code to remove generated CSS from JavaScript files and create CSS assets.

_Currently, all CSS rules will be extracted to a single CSS file i.e. [code splitting](https://webpack.js.org/guides/code-splitting/) for extracted CSS **will not work**._
