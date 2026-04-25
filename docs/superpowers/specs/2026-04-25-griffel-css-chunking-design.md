# Griffel CSS chunking via cascade layers

**Status:** Draft
**Date:** 2026-04-25
**Repro:** `apps/chunking-repro/`

## Problem

`@griffel/webpack-plugin` today forces every `.griffel.css` module into a
single SplitChunks cache group named `'griffel'` (`enforce: true`,
`chunks: 'all'`). After `mini-css-extract-plugin` concatenates them the
plugin re-parses the merged asset and globally sorts rules by
`(media, bucket, priority)` across the 14-bucket scheme defined in
`@griffel/core` (`r, d, l, v, w, f, i, h, a, s, k, t, m, c`).

The single chunk is required because Griffel atomic rules use
single-class selectors. Specificity between any two atomic rules is
identical, so the cascade resolves them by **source order** alone. As
soon as those rules live in two or more CSS files, source order is
governed by browser `<link>` evaluation order — which is not guaranteed
by webpack across preload, prefetch, route splits, or arbitrary load
graphs.

The repro under `apps/chunking-repro/` makes this concrete. Two webpack
entries plus a shared module compile in two modes:

- **Default** — single `griffel.css` (current behavior). Rules sorted
  globally; LVHA + shorthand→longhand priority correct.
- **Split** (a six-line `DisableGriffelChunkMergePlugin` deletes the
  forced cache group) — three CSS files. `226.css` ships
  `display:block` → `padding:12px` (p=−1) → `border:1px solid black`
  (p=−2), inverse of the priority order, and `:hover` / `@media` rules
  duplicate across `page-a.css` / `page-b.css`.

We want the default `SplitChunksPlugin` chunking behavior to apply to
griffel CSS too, without giving up cascade correctness.

## Goal

Allow webpack's default `SplitChunksPlugin` to chunk `.griffel.css`
modules naturally (vendors group, async splits, shared-module hoisting)
while preserving deterministic cascade ordering across files.

Out of scope:

- Module Federation / independently-built bundles.
- Mitigating Griffel's "atomic rules lose to consumer unlayered CSS"
  trade-off (the user's prior concerns A/B). Documented; not addressed.
- Changing runtime DOM rendering behavior.

## Approach: CSS Cascade Layers, opt-in

Wrap each emitted atomic rule in a CSS `@layer` whose name encodes the
rule's `(bucket, priority [, media-query-index])`. Declare layer order
once at the top of every emitted griffel CSS chunk. Layer order takes
precedence over source order in the CSS cascade, which removes the
file-load-order dependency.

This is gated behind a new plugin option,
`GriffelPlugin({ unstable_layeredOutput: true })`. When the flag is
disabled the plugin behaves exactly as it does today.

### Layer scheme

A single `@layer` declaration prepended to every griffel CSS asset:

```css
@layer
  griffel.r,
  griffel.d.s-2, griffel.d.s-1, griffel.d,
  griffel.l, griffel.v, griffel.w, griffel.f, griffel.i, griffel.h, griffel.a,
  griffel.s, griffel.k, griffel.t,
  griffel.m.q0, griffel.m.q1, /* ... one entry per discovered @media query, in compareMediaQueries order ... */
  griffel.c.q0, griffel.c.q1; /* ... one entry per discovered @container query ... */
```

Each emitted rule is wrapped in its matching layer. The
`@griffel:css-start` / `@griffel:css-end` marker comments stay **outside**
the layer wrapper so the existing top-level parser in
`parseCSSRules` can still find them:

```css
/** @griffel:css-start [d] {"p":-2} **/
@layer griffel.d.s-2 { .f1abc{border:2px solid red} }
/** @griffel:css-end **/

/** @griffel:css-start [d] null **/
@layer griffel.d { .f2xyz{color:red} }
/** @griffel:css-end **/

/** @griffel:css-start [h] null **/
@layer griffel.h { .f3:hover{color:blue} }
/** @griffel:css-end **/

/** @griffel:css-start [m] {"m":"(min-width: 800px)"} **/
@layer griffel.m.q1 { @media (min-width: 800px){.f4{color:orange}} }
/** @griffel:css-end **/
```

CSS layer ordering is set by the **first** declaration the browser
encounters; subsequent identical declarations are no-ops. Because every
emitted griffel chunk repeats the same manifest, whichever chunk loads
first establishes a deterministic order across all chunks.

### Bucket reclassification (gated)

`getStyleBucketName` today bases the bucket on the leading character of
`selectors[0]`. Selectors that don't start with a pseudo (e.g.
`'& .foo:hover'`, `'&.disabled:hover'`) currently fall into bucket `d`
and rely on **selector specificity** (multiple classes ⇒ ≥ (0,2,1)) to
beat plain `.f1:hover` (0,1,1). Once we wrap by bucket, layer order
trumps specificity — so a plain `:hover` in `griffel.h` would defeat a
nested `& .foo:hover` in `griffel.d`. That is a regression.

Fix: when the layered output strategy is in effect, reclassify rules by
the **last LVHA pseudo found anywhere in the selector**, not just at the
start. Plain `.f1:hover` and nested `.f2 .foo:hover` then both live in
`griffel.h`, and within that single layer specificity continues to do
its job (nested still beats plain).

The reclassification is an opt-in strategy, plumbed from the plugin
through the loader → `transformSync` → `resolveStyleRules` →
`getStyleBucketName`. Default behavior (no flag) is unchanged.

### Priority via sub-layers

`computePropertyPriority` assigns each rule a priority from a bounded
set defined by `shorthands.ts` (`-2, -1, 0`). The shorthand-before-
longhand source order is currently emergent from the global sort; once
chunks split, priority is no longer enforced cross-file.

For each non-media bucket that allows priority (today: `d`), declare a
sub-layer per priority value (`griffel.d.s-2`, `griffel.d.s-1`,
`griffel.d`). Wrap each rule in its priority sub-layer. Layer order
encodes priority deterministically across chunks.

### Media and container queries via build-time-discovered sub-layers

The plugin scans every griffel-bearing CSS asset in the compilation
during `processAssets`, collects the union set of `@media` and
`@container` queries, sorts each set with the configured
`compareMediaQueries` (and the analogous container query comparator),
and assigns each query a stable index. The sorted indices appear in the
manifest as `griffel.m.q0`, `griffel.m.q1`, … and
`griffel.c.q0`, `griffel.c.q1`, …. Each rule references the index for
its specific query.

This treats overlapping media queries deterministically — e.g. on a
1500px viewport, an `@media (min-width: 800px)` rule from one chunk and
an `@media (min-width: 1200px)` rule from another resolve via layer
order rather than file load order.

The query index is derived from a deterministic build-wide sort, so
unchanged inputs produce unchanged output. New queries introduced by a
later edit may shift indices; that is acceptable since the manifest is
rewritten on every build.

The loader does not know the global index of a query at module-loader
time. It emits a deterministic placeholder layer name derived from a
short, stable hash of the query string. The placeholder is a valid CSS
ident:

- Format: `griffel.m.__griffelmq_<hash>__`
- Hash: first 8 hex chars of the same string hash already used by
  `@griffel/core` for class names (`hashString` in
  `@emotion/hash`), keyed off the query text.
- Container queries use the same scheme with prefix `__griffelcq_`.

The plugin's `processAssets` pass:
1. Reads each asset's `@griffel:css-start [m] {"m":"<query>"}` markers,
   collects the union set of `<query>` strings.
2. Sorts the set with `compareMediaQueries`, assigns each query an
   index `q0`, `q1`, ….
3. Computes the same hash for each query and builds a
   `hash → q<N>` mapping.
4. Substitutes `__griffelmq_<hash>__` → `q<N>` (and the analogous
   container query mapping) in every asset's CSS source.

8 hex chars provide ~32 bits of entropy. For a typical bundle's small
set of media queries (~tens), birthday-paradox collisions are
vanishingly unlikely. The implementation does not check for collisions
at build time; if a collision occurs, the second query silently picks
up the first one's index, which would surface as a visible cascade
bug. If real-world collisions are observed, future work can add
detection in the asset-time pass and widen the hash window.

### Bucket `t` (`@layer` / `@supports`) and bucket `r`

These buckets are not split into sub-layers in V1.

- Bucket `r` (reset rules) — keyed by reset class hash; rules across
  chunks are independent (each reset class is a distinct identifier).
  No cross-chunk overlap on the same property under the same selector.
  A single `griffel.r` layer is sufficient.
- Bucket `t` (`@layer` / `@supports`) — user-authored at-rules. User
  `@layer` and `@supports` carry their own cascade semantics; layering
  griffel content under a `griffel.t` layer is sufficient and overlap
  scenarios are not common atomic-CSS authoring patterns.

If real cross-chunk overlap problems emerge for these buckets, sub-
layer treatment can be extended in a follow-up.

### What the plugin does at build time

1. **Loader pass** — when `unstable_layeredOutput` is on, the loader
   passes `bucketStrategy: 'extended'` to `transformSync`, then for each
   `/** @griffel:css-start [bucket] {meta} **/ ... /** @griffel:css-end **/`
   block emitted by the existing pipeline, wraps the rules between the
   markers in `@layer griffel.<bucket>[.s<priority>] { ... }`. Media
   and container query rules use a hashed placeholder layer name (see
   above). The marker comments themselves stay **outside** the layer
   wrapper so `parseCSSRules` continues to find them at the top level
   of the asset.
2. **`processAssets` pass** — for every asset that contains
   `/** @griffel:css-start`:
   - Parse with the existing `parseCSSRules`.
   - Aggregate the union of media / container queries across assets.
   - Sort with `compareMediaQueries`; assign each query a `q<N>` index.
   - Build the global manifest declaration.
   - For each asset: prepend the manifest, swap placeholder layer names
     for indexed ones, locally sort rules within the file (defensive,
     to keep file-internal output stable across builds — correctness
     does not depend on it).
3. **SplitChunks** — when `unstable_layeredOutput` is on, the plugin
   does NOT inject the forced `'griffel'` cache group and does NOT
   register the `moveCSSModulesToGriffelChunk` fallback. Webpack's
   default `SplitChunksPlugin` chunks `.griffel.css` modules naturally.
4. **`unstable_attachToEntryPoint`** — incompatible with
   `unstable_layeredOutput` (single-chunk semantics). The plugin throws
   if both are set.

### What does NOT change

- Runtime DOM renderer (`createDOMRenderer`,
  `getStyleSheetForBucket`, `rehydrateRendererCache`). No `@layer`
  emitted at runtime; `<style data-bucket=…>` insertion order continues
  to drive the cascade for the runtime path.
- SSR rehydration. The runtime renderer still produces and reads
  `<style data-bucket=…>` tags identically.
- Default plugin behavior when the flag is off.
- Public API of `makeStyles` / `makeResetStyles` / `makeStaticStyles`.
- The 14 bucket names and their relative ordering in
  `styleBucketOrdering`.

## Trade-offs and known limitations

- **Layered rules lose to unlayered consumer / third-party CSS.** A
  user's plain `.btn { color: red }` defeats any `@layer griffel.*`
  rule regardless of specificity. Recommend wrapping consumer styles in
  their own layer (or accepting that "unlayered = override territory").
  Out of scope for this design.
- **Mixed extraction + runtime caveat.** If an app extracts some styles
  (layered output) but renders others at runtime, an extracted rule may
  live in `@layer griffel.h` while a runtime rule for the same property
  is inserted into the unlayered `<style data-bucket=d>` tag. Cascade
  is undefined for that mixed scenario. Most users either extract
  fully or don't extract at all. Documented as a caveat.
- **Browser support.** `@layer` is supported in Chrome 99+, Safari
  15.4+, Firefox 97+ (released early 2022). Apps with a baseline below
  this should leave `unstable_layeredOutput` off.
- **Manifest size in every chunk.** A few hundred bytes of `@layer`
  declaration repeats in every griffel CSS asset. Acceptable cost.
- **Container queries.** Treated symmetrically with media queries via
  `griffel.c.q<N>` sub-layers. Same trade-offs.
- **`@layer` and `@supports` user content (bucket `t`).** Not split
  into per-rule sub-layers in V1. Cross-chunk overlap behavior follows
  source order within the single `griffel.t` layer. If this surfaces
  problems we can extend.

## Implementation surface

### `@griffel/core`

- `getStyleBucketName(selectors, atRules, options?)` — accepts an
  optional `strategy: 'leading' | 'extended'` parameter. Default
  `'leading'` preserves current behavior. `'extended'` walks the full
  selector for the last LVHA pseudo.
- `resolveStyleRules` and its callers (`__styles`, `__resetStyles`,
  `__staticStyles`) accept and forward the strategy through to
  `getStyleBucketName`.
- New tests for nested-pseudo cases under `extended` strategy.
- No change to `styleBucketOrdering`, runtime renderer, or
  `getStyleSheetForBucket`.

### `@griffel/transform` (and `@griffel/transform-shaker`)

- `transformSync` accepts a `bucketStrategy` option and forwards it to
  the underlying `resolveStyleRules` call inside the AST evaluator.
- New tests covering nested-pseudo bucketing under the extended
  strategy.

### `@griffel/webpack-plugin`

- New plugin option: `unstable_layeredOutput?: boolean`.
- When enabled:
  - Loader sets `bucketStrategy: 'extended'` on the transform call.
  - `generateCSSRules` (in
    `packages/webpack-plugin/src/utils/generateCSSRules.mts`) gains a
    `wrapInLayer: true` option that, for each emitted bucket-entry
    block, wraps the rules between
    `/** @griffel:css-start [B] {meta} **/` and
    `/** @griffel:css-end **/` in
    `@layer griffel.<B>[.s<priority>][.<placeholder>] { ... }` while
    leaving the marker comments themselves outside the wrapper.
    Media/container blocks use the hashed placeholder name described
    in the "Media and container queries" section.
  - Plugin skips the SplitChunks forced cache group injection AND the
    `moveCSSModulesToGriffelChunk` fallback.
  - Plugin's `processAssets` step iterates **all** assets, builds the
    manifest from the union set of queries, prepends it to each
    griffel asset, and replaces placeholder layer names with the
    indexed `q<N>` form.
- When disabled:
  - All current behavior preserved (forced single chunk + global sort).
- `unstable_attachToEntryPoint` + `unstable_layeredOutput` together
  throws at construction time with a clear message.
- New unit tests in `GriffelPlugin.test.mts` exercising:
  - Manifest emission shape.
  - Per-rule layer wrapping by bucket and priority.
  - Media query index assignment with two overlapping queries across
    distinct chunks.
  - Falls-back behavior when flag is off (no diff vs. today).

### `apps/chunking-repro/`

- Add a third build mode `--layered` that runs with
  `unstable_layeredOutput: true` and writes to
  `dist/apps/chunking-repro/layered/`.
- Update `README.md` to document the layered mode and verify in
  browser/devtools that overlapping rules resolve via layer order, not
  file load order.

## Validation plan

- Unit: bucket reclassification snapshot tests in `@griffel/core`.
- Unit: extraction snapshot tests in `@griffel/webpack-plugin` for
  every emitted bucket × priority combination, plus media/container
  cases.
- Repro app: side-by-side default vs. split vs. layered output, with
  observable cascade differences in browser devtools.
- Existing `e2e/rspack` and `e2e/nextjs` should keep passing with the
  flag off (no-op default).

## Migration path

1. Land the flag under `unstable_layeredOutput` for a release cycle.
2. Capture community feedback on the `@layer`-vs-unlayered consumer
   trade-off and the mixed-mode caveat.
3. Promote to a stable option (`layeredOutput`) once feedback settles.
4. Optionally: explore a "user opt-in to wrap their CSS in a layer"
   companion documentation pattern, separate from the plugin work.
