# @griffel/utils

Optional utilities for [Griffel](https://github.com/microsoft/griffel). These are not required to use Griffel — reach for them when you need to customize behavior such as the ordering of at-rules.

## Install

```bash
yarn add @griffel/utils
# or
npm install @griffel/utils
```

## `compareContainerQueries`

A comparator that orders `@container` query conditions numerically so that mobile-first `min-width` rules cascade by ascending width automatically (the highest matching breakpoint wins), with `max-width` ordered descending.

By default Griffel orders container queries with the same lexicographic comparator it uses for media queries. That is enough for simple cases but breaks across magnitudes (e.g. `1024px` would sort before `720px`). Pass `compareContainerQueries` to opt into numeric ordering.

At runtime, via the renderer:

```js
import { createDOMRenderer } from '@griffel/core';
import { compareContainerQueries } from '@griffel/utils';

const renderer = createDOMRenderer(document, { compareContainerQueries });
```

At build time, via the webpack extraction plugin:

```js
const { GriffelCSSExtractionPlugin } = require('@griffel/webpack-extraction-plugin');
const { compareContainerQueries } = require('@griffel/utils');

new GriffelCSSExtractionPlugin({ compareContainerQueries });
```

### Ordering semantics

- `max-width` conditions come first, ordered descending (a smaller `max-width` wins at smaller container sizes).
- `min-width` conditions come next, ordered ascending (a larger `min-width` wins at larger container sizes).
- Conditions without a parseable width, or ties, fall back to a stable lexicographic comparison.

The condition string may include a container name prefix (e.g. `foo (min-width: 480px)`); the width is parsed regardless of the prefix.
