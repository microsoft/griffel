# @griffel/sort-css-queries

Optional utilities for [Griffel](https://github.com/microsoft/griffel). These are not required to use Griffel — reach for them when you need to customize behavior such as the ordering of at-rules.

## Install

```bash
yarn add @griffel/sort-css-queries
# or
npm install @griffel/sort-css-queries
```

## `compareCSSQueries`

A comparator that orders CSS query conditions — `@media` or `@container` — numerically so that responsive rules cascade in the correct order regardless of magnitude: mobile-first `min` rules ascend (the highest matching breakpoint wins) and desktop-first `max` rules descend.

By default Griffel orders queries with a lexicographic comparator. That is enough for simple cases but breaks across magnitudes (e.g. `1024px` would sort before `720px`). Pass `compareCSSQueries` into the `compareMediaQueries` and/or `compareContainerQueries` option to opt into numeric ordering. Because the order is derived purely from the condition string, it is identical at build time and runtime.

At runtime, via the renderer:

```js
import { createDOMRenderer } from '@griffel/core';
import { compareCSSQueries } from '@griffel/sort-css-queries';

const renderer = createDOMRenderer(document, {
  compareMediaQueries: compareCSSQueries,
  compareContainerQueries: compareCSSQueries,
});
```

At build time, via the webpack extraction plugin:

```js
const { GriffelCSSExtractionPlugin } = require('@griffel/webpack-extraction-plugin');
const { compareCSSQueries } = require('@griffel/sort-css-queries');

new GriffelCSSExtractionPlugin({
  compareMediaQueries: compareCSSQueries,
  compareContainerQueries: compareCSSQueries,
});
```

### Supported condition forms

The comparator receives only the at-rule condition string (never the selector or declarations) and reads `min`/`max` sizing features, with an optional `@container` name prefix:

- `min-width` / `max-width` and `min-height` / `max-height` — e.g. `(min-width: 720px)`, `(max-height: 1023px)`
- `and` bands and cross-axis `and` of those features — `(max-width: 730px) and (min-width: 513px)`, `(min-width: 480px) and (min-height: 320px)`
- lengths in `px` or unitless `0`; `rem`/`em` are converted to px (against a configurable root font size, 16px by default)

Any condition without a `min`/`max` feature — `style(--x)` container queries, or range-operator/interval syntax such as `(width > 200px)` or `(587px <= width <= 901px)` — is treated as non-ordered and falls back to a stable lexicographic comparison. The comparator never throws on unexpected input.

### Custom `rem` / `em` root font size

`rem`/`em` lengths are converted to pixels so they compare against `px` values. By default a 16px root is assumed. If your app uses a different root font size (e.g. `font-size: 62.5%` makes `1rem = 10px`), build a comparator with `createCompareCSSQueries` and pass `rootFontSize`:

```js
import { createDOMRenderer } from '@griffel/core';
import { createCompareCSSQueries } from '@griffel/sort-css-queries';

const compareCSSQueries = createCompareCSSQueries({ rootFontSize: 10 });

const renderer = createDOMRenderer(document, {
  compareMediaQueries: compareCSSQueries,
  compareContainerQueries: compareCSSQueries,
});
```

And the matching build-time configuration:

```js
const { GriffelCSSExtractionPlugin } = require('@griffel/webpack-extraction-plugin');
const { createCompareCSSQueries } = require('@griffel/sort-css-queries');

const compareCSSQueries = createCompareCSSQueries({ rootFontSize: 10 });

new GriffelCSSExtractionPlugin({
  compareMediaQueries: compareCSSQueries,
  compareContainerQueries: compareCSSQueries,
});
```

Use the **same** `rootFontSize` at build time and runtime so the ordering stays identical. The default `compareCSSQueries` export is exactly `createCompareCSSQueries()` (16px root).

### Ordering semantics

The comparator defines a **total order** (stable, transitive, antisymmetric), so `Array.sort` output is reproducible and identical between build and runtime.

1. **Bucket** (primary key): upper-bound-only (`max`, desktop-first) → lower-bound-only (`min`, mobile-first) → bounded range (`min` + `max`) → non-size.
2. **Axis** within a bucket: width before height, keyed on the condition's primary axis (width if the condition has any width feature, otherwise height).
3. **Numeric** compare on the governing bound: lower-bound family ascending (a larger `min` wins at larger sizes), upper-bound family descending (a smaller `max` wins at smaller sizes).
4. **Tiebreaks**: container name lexicographic, then the full original string lexicographic. Equal strings return `0`.

The condition string may include a container name prefix (e.g. `foo (min-width: 480px)`); the size is parsed regardless of the prefix.

### Documented tiebreak choices for bands and cross-axis `and`

An `and` combination contributes every `min`/`max` feature it contains, and a couple of choices are made deliberately so the behavior is auditable:

- A **band** that mixes a `min` and a `max` on the same axis (`(max-width: 730px) and (min-width: 513px)`) has both a lower and an upper bound, so it lands in the **bounded-range** bucket. Bounded ranges are governed by their **lower bound ascending**, with the **upper bound as the numeric tiebreak** (also ascending).
- A **cross-axis** `and` of two lower bounds (`(min-width: 480px) and (min-height: 320px)`) has only lower bounds, so it stays in the **lower-bound-only** (mobile-first) bucket. Its **primary axis is width** (width is preferred whenever present), and it is ordered by the **largest lower bound on that primary axis** ascending.
- When a single condition carries multiple bounds of the same kind on the primary axis, the **tightest** one governs — the largest `min` for lower bounds, the smallest `max` for upper bounds.

This is 100% backward compatible with the previous `min-width`/`max-width`-only comparator: pure width inputs keep the same relative order.
