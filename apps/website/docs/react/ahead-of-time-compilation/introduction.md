---
sidebar_position: 1
---

# Introduction

While there is nothing wrong with the associated runtime costs of a CSS-in-JS engine, larger and more complex applications might want to optimize for performance.

Griffel does the expensive runtime work only happens on the first render of the component. This one-time work can be further optimized at build time by pre-computing and transforming styles.

## What to use?

- For library developers, please use [Babel preset](/react/ahead-of-time-compilation/with-babel)
- For application developers, please use [Webpack loader](/react/ahead-of-time-compilation/with-webpack) (supports Next.js)
