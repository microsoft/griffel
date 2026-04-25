# Griffel CSS chunking via cascade layers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow webpack's default `SplitChunksPlugin` to chunk Griffel-extracted CSS into multiple files without breaking cascade order, by wrapping each emitted atomic rule in a CSS Cascade Layer (`@layer griffel.<bucket>[.s<priority>][.q<N>]`) gated behind a new opt-in `unstable_layeredOutput` plugin option.

**Architecture:** Build-time emission only — the runtime DOM renderer is untouched. The `@griffel/webpack-plugin` loader wraps each `@griffel:css-start ... @griffel:css-end` block in `@layer …`, with a hash-based placeholder for media/container query layers. A new `processAssets` pass aggregates `@media`/`@container` queries across all griffel-bearing CSS assets, sorts them via `compareMediaQueries`, builds a global manifest, prepends it to every griffel asset, and substitutes hash placeholders for indexed `q<N>` names. A new `bucketStrategy: 'extended'` option in `@griffel/core` (plumbed through `@griffel/transform`) reclassifies nested-pseudo selectors (`& .foo:hover`) into their pseudo bucket so layer order doesn't defeat their specificity.

**Tech Stack:** TypeScript, Vitest, Webpack 5, mini-css-extract-plugin, stylis, @emotion/hash. Monorepo orchestrated by Nx + Yarn workspaces. Built artifacts in `dist/packages/<name>/`.

**Spec:** `docs/superpowers/specs/2026-04-25-griffel-css-chunking-design.md`

**Repro:** `apps/chunking-repro/`

---

## File map

**`@griffel/core` (`packages/core/src/`)**
- Modify `runtime/getStyleBucketName.ts` — accept `strategy: 'leading' | 'extended'`. Default `'leading'` (current behavior).
- Modify `runtime/getStyleBucketName.test.ts` — add cases for `'extended'`.
- Modify `runtime/resolveStyleRules.ts` — accept `options.bucketStrategy` and forward to `getStyleBucketName`.
- Modify `runtime/resolveResetStyleRules.ts` — accept the same option (resets can have at-rule pseudos too).
- Modify `resolveStyleRulesForSlots.ts` — accept and forward the option.

**`@griffel/transform` (`packages/transform/src/`)**
- Modify `transformSync.mts` — add `bucketStrategy?: 'leading' | 'extended'` to `TransformOptions`, forward into the two `resolveStyleRules*` call sites at lines 349 and 366.

**`@griffel/webpack-plugin` (`packages/webpack-plugin/src/`)**
- Modify `webpackLoader.mts` — accept `bucketStrategy` in loader options; pass to `transformSync`; pass `wrapInLayer: true` (and salt) to the new `generateCSSRules` mode.
- Modify `utils/generateCSSRules.mts` — accept a `wrapInLayer: boolean` option; when true, wrap each bucket-entry block in `@layer griffel.<bucket>[.s<priority>][.<placeholder>] { … }`. Marker comments stay outside the wrapper.
- Create `utils/layerNames.mts` — pure helpers: `bucketLayerName(bucket, priority?)`, `mediaPlaceholder(query)`, `containerPlaceholder(query)`.
- Modify `GriffelPlugin.mts` — add `unstable_layeredOutput?: boolean` option; when on, skip the SplitChunks cache group injection and the `moveCSSModulesToGriffelChunk` fallback; throw if combined with `unstable_attachToEntryPoint`; pass `bucketStrategy: 'extended'` to the loader context; in `processAssets`, aggregate queries across all griffel-bearing CSS assets and rewrite each asset.
- Modify `constants.mts` — extend `SupplementedLoaderContext` with `bucketStrategy` and `wrapInLayer` flags.
- Modify `utils/parseCSSRules.mts` — no functional change; verify it tolerates the new layered output.

**Tests**
- Modify `packages/webpack-plugin/src/GriffelPlugin.test.mts` — add cases that exercise `unstable_layeredOutput`.
- Add `packages/webpack-plugin/src/utils/generateCSSRules.test.mts` (does not yet exist) — unit-test `wrapInLayer`.
- Add `packages/webpack-plugin/src/utils/layerNames.test.mts` — unit-test pure helpers.

**Repro app (`apps/chunking-repro/`)**
- Modify `build.mjs` — add `--layered` mode that passes `unstable_layeredOutput: true` and writes to `dist/apps/chunking-repro/layered/`.
- Modify `serve.mjs` — accept `--layered` flag and serve the layered build dir.
- Modify `project.json` — add a `build:layered` Nx target.
- Modify `README.md` — describe the layered mode and what to verify in DevTools.

---

## Working in the monorepo (read first)

The webpack-plugin imports `@griffel/core` and `@griffel/transform` as workspace dependencies. After modifying `@griffel/core` you must rebuild it before the plugin (or the chunking-repro) sees your changes:

```sh
yarn nx run @griffel/core:build
yarn nx run @griffel/transform:build
yarn nx run @griffel/webpack-plugin:build
```

The chunking-repro imports the **dist** of these packages via webpack `resolve.alias` and `resolveLoader.alias` (see `apps/chunking-repro/build.mjs`). Tests inside each package run against source via tsconfig path mappings, so you don't need to rebuild before running unit tests.

To run a single package's tests:

```sh
yarn nx run @griffel/core:test
yarn nx run @griffel/webpack-plugin:test
```

Vitest is the test runner. Tests live next to source as `*.test.ts` / `*.test.mts`.

---

## Task 1: Extend `getStyleBucketName` with `'extended'` strategy

**Files:**
- Modify: `packages/core/src/runtime/getStyleBucketName.ts`
- Modify: `packages/core/src/runtime/getStyleBucketName.test.ts`

This task adds a new optional `strategy` parameter. Default behavior is unchanged. With `'extended'` the function walks the entire selector and returns the bucket of the **last** LVHA pseudo found anywhere — fixing the regression where nested pseudos like `& .foo:hover` end up in bucket `d` and lose to plain `:hover` inside `@layer griffel.h`.

- [ ] **Step 1: Add failing tests for the `'extended'` strategy**

In `packages/core/src/runtime/getStyleBucketName.test.ts` append the following block before the closing `});` of the existing `describe`:

```ts
  it("returns leading-pseudo bucket by default", () => {
    expect(
      getStyleBucketName([' .foo:hover'], { container: '', media: '', supports: '', layer: '' })
    ).toBe('d');
    expect(
      getStyleBucketName(['.disabled:hover'], { container: '', media: '', supports: '', layer: '' })
    ).toBe('d');
  });

  it("with strategy='extended' classifies by last LVHA pseudo anywhere in selector", () => {
    const ar = { container: '', media: '', supports: '', layer: '' };

    // Plain pseudos still map the same as the default strategy.
    expect(getStyleBucketName([':hover'], ar, 'extended')).toBe('h');
    expect(getStyleBucketName([':active'], ar, 'extended')).toBe('a');
    expect(getStyleBucketName([':link'], ar, 'extended')).toBe('l');
    expect(getStyleBucketName([':visited'], ar, 'extended')).toBe('v');
    expect(getStyleBucketName([':focus-within'], ar, 'extended')).toBe('w');
    expect(getStyleBucketName([':focus-visible'], ar, 'extended')).toBe('i');
    expect(getStyleBucketName([':focus'], ar, 'extended')).toBe('f');

    // Nested pseudos are reclassified.
    expect(getStyleBucketName([' .foo:hover'], ar, 'extended')).toBe('h');
    expect(getStyleBucketName(['.disabled:hover'], ar, 'extended')).toBe('h');
    expect(getStyleBucketName([' .foo:focus .bar'], ar, 'extended')).toBe('f');
    expect(getStyleBucketName([' .foo:active'], ar, 'extended')).toBe('a');

    // Multiple LVHA pseudos: the last occurrence wins.
    expect(getStyleBucketName([':focus:hover'], ar, 'extended')).toBe('h');
    expect(getStyleBucketName([':hover:active'], ar, 'extended')).toBe('a');

    // Selectors with no LVHA pseudo still go to default.
    expect(getStyleBucketName(['.foo'], ar, 'extended')).toBe('d');
    expect(getStyleBucketName([' .foo:checked'], ar, 'extended')).toBe('d');

    // At-rules still take precedence over selector parsing.
    expect(
      getStyleBucketName([' .foo:hover'], { ...ar, media: '(min-width: 800px)' }, 'extended')
    ).toBe('m');
    expect(
      getStyleBucketName([' .foo:hover'], { ...ar, layer: 'theme' }, 'extended')
    ).toBe('t');
  });
```

- [ ] **Step 2: Run the new tests and verify they fail**

```sh
yarn nx run @griffel/core:test --testPathPattern getStyleBucketName
```

Expected: the two new `it` blocks fail with `TypeError` or wrong return values (the third positional argument is currently ignored).

- [ ] **Step 3: Implement the `'extended'` strategy**

Replace the body of `packages/core/src/runtime/getStyleBucketName.ts` with:

```ts
import type { StyleBucketName } from '../types.js';
import type { AtRules } from './utils/types.js';

const pseudosMap: Record<string, StyleBucketName | undefined> = {
  // :focus-within
  'us-w': 'w',
  // :focus-visible
  'us-v': 'i',

  // :link
  nk: 'l',
  // :visited
  si: 'v',
  // :focus
  cu: 'f',
  // :hover
  ve: 'h',
  // :active
  ti: 'a',
};

export type BucketStrategy = 'leading' | 'extended';

// Regex matches `:link`, `:visited`, `:focus`, `:focus-visible`, `:focus-within`,
// `:hover`, `:active`, irrespective of position. Returned in selector order;
// the caller picks the last match (LVHA: last hit wins).
const LVHA_PSEUDO_RE = /:(?:link|visited|focus-visible|focus-within|focus|hover|active)\b/g;

function lookupPseudoBucket(pseudo: string): StyleBucketName | undefined {
  // pseudo is e.g. ':hover' or ':focus-visible'.
  return (
    // 4..8 disambiguates 'focus-visible' / 'focus-within' / 'focus'.
    pseudosMap[pseudo.slice(4, 8)] ||
    pseudosMap[pseudo.slice(3, 5)]
  );
}

export function getStyleBucketName(
  selectors: string[],
  atRules: AtRules,
  strategy: BucketStrategy = 'leading',
): StyleBucketName {
  if (atRules.media) {
    return 'm';
  }

  if (atRules.layer || atRules.supports) {
    return 't';
  }

  if (atRules.container) {
    return 'c';
  }

  if (selectors.length > 0) {
    const normalizedSelector = selectors[0].trim();

    // Fast path: leading-pseudo classification (default behavior).
    if (normalizedSelector.charCodeAt(0) === 58 /* ":" */) {
      return lookupPseudoBucket(normalizedSelector) || 'd';
    }

    // Extended strategy: walk the full selector for the last LVHA pseudo.
    if (strategy === 'extended') {
      let lastMatch: RegExpExecArray | null = null;
      let match: RegExpExecArray | null;

      LVHA_PSEUDO_RE.lastIndex = 0;
      while ((match = LVHA_PSEUDO_RE.exec(normalizedSelector)) !== null) {
        lastMatch = match;
      }

      if (lastMatch) {
        return lookupPseudoBucket(lastMatch[0]) || 'd';
      }
    }
  }

  return 'd';
}
```

- [ ] **Step 4: Run the tests and verify they pass**

```sh
yarn nx run @griffel/core:test --testPathPattern getStyleBucketName
```

Expected: all `getStyleBucketName` tests pass, including the previously failing ones.

- [ ] **Step 5: Commit**

```sh
git add packages/core/src/runtime/getStyleBucketName.ts \
        packages/core/src/runtime/getStyleBucketName.test.ts
git commit -m "feat(core): add 'extended' bucket strategy in getStyleBucketName

$(printf '%s\n' 'Adds an optional strategy parameter to getStyleBucketName. The new' \
  '"extended" strategy walks the full selector and bucketizes by the last' \
  'LVHA pseudo found anywhere, instead of only the leading character.')
"
```

---

## Task 2: Plumb `bucketStrategy` through `resolveStyleRules`

**Files:**
- Modify: `packages/core/src/runtime/resolveStyleRules.ts`
- Modify: `packages/core/src/runtime/resolveStyleRules.test.ts`

`resolveStyleRules` is the main runtime/build entry point. It calls `getStyleBucketName` for every property and recurses into nested selectors. We add an `options` argument containing `bucketStrategy` and forward it through every recursive call.

- [ ] **Step 1: Add a failing test that asserts nested pseudos move buckets under `'extended'`**

In `packages/core/src/runtime/resolveStyleRules.test.ts`, find the existing `describe('resolveStyleRules', () => { … })` and add the following test inside it (before the closing `});`):

```ts
  it("with bucketStrategy='extended', nested-pseudo rules land in the pseudo bucket", () => {
    const [, defaultRules] = resolveStyleRules({
      '& .icon:hover': { color: 'red' },
    });
    // Default behavior: nested-pseudo lands in bucket 'd'.
    expect(Object.keys(defaultRules)).toContain('d');
    expect(defaultRules.h ?? []).toHaveLength(0);

    const [, extendedRules] = resolveStyleRules(
      { '& .icon:hover': { color: 'red' } },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { bucketStrategy: 'extended' },
    );
    // Extended behavior: same rule lands in bucket 'h'.
    expect(extendedRules.h ?? []).toHaveLength(1);
    expect(extendedRules.d ?? []).toHaveLength(0);
  });
```

- [ ] **Step 2: Run the test and verify it fails**

```sh
yarn nx run @griffel/core:test --testPathPattern resolveStyleRules
```

Expected: `expect(extendedRules.h ?? []).toHaveLength(1)` fails because the `options` argument is currently ignored / signature mismatch.

- [ ] **Step 3: Add `options` to the signature and forward it to `getStyleBucketName`**

Open `packages/core/src/runtime/resolveStyleRules.ts`. At the top of the file, add the import alongside the existing `import { getStyleBucketName }`:

```ts
import type { BucketStrategy } from './getStyleBucketName.js';
```

Add the option type just below the `import` block:

```ts
export type ResolveStyleRulesOptions = {
  /**
   * Controls how rule selectors map to style buckets.
   * - 'leading' (default): preserves historical behavior (pseudo at start of selector only).
   * - 'extended': bucketizes by the last LVHA pseudo found anywhere in the selector.
   */
  bucketStrategy?: BucketStrategy;
};
```

Update the `resolveStyleRules` signature to accept `options` as a trailing parameter:

```ts
export function resolveStyleRules(
  styles: GriffelStyle,
  classNameHashSalt: string = '',
  selectors: string[] = [],
  atRules: AtRules = {
    container: '',
    layer: '',
    media: '',
    supports: '',
  },
  cssClassesMap: CSSClassesMap = {},
  cssRulesByBucket: CSSRulesByBucket = {},
  rtlValue?: string,
  options: ResolveStyleRulesOptions = {},
): [CSSClassesMap, CSSRulesByBucket] {
```

In the function body, replace **every** call to `getStyleBucketName(selectors, atRules)` with `getStyleBucketName(selectors, atRules, options.bucketStrategy)`. There are exactly two such call sites today (around lines 170 and 307 in the current file).

In every recursive call to `resolveStyleRules(...)` inside the function (there are several — for nested selectors, media queries, layers, supports, container queries, and shorthand resets), pass `options` as the trailing argument so the strategy propagates. Search for `resolveStyleRules(` in this file and add `, options` to every recursive call. Concretely, every existing recursive call should end like `…, cssRulesByBucket, rtlValue, options)` or `…, cssRulesByBucket, undefined, options)`.

- [ ] **Step 4: Run the test and verify it passes**

```sh
yarn nx run @griffel/core:test --testPathPattern resolveStyleRules
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```sh
git add packages/core/src/runtime/resolveStyleRules.ts \
        packages/core/src/runtime/resolveStyleRules.test.ts
git commit -m "feat(core): plumb bucketStrategy through resolveStyleRules

Adds an options parameter to resolveStyleRules and forwards
bucketStrategy to getStyleBucketName from every call site, including
recursive descents into nested selectors and at-rules."
```

---

## Task 3: Plumb `bucketStrategy` through `resolveStyleRulesForSlots` and `resolveResetStyleRules`

**Files:**
- Modify: `packages/core/src/resolveStyleRulesForSlots.ts`
- Modify: `packages/core/src/runtime/resolveResetStyleRules.ts`

These are the two callers used by the build-time transform.

- [ ] **Step 1: Update `resolveStyleRulesForSlots` to accept and forward options**

Open `packages/core/src/resolveStyleRulesForSlots.ts` and replace its entire content with:

```ts
import type { GriffelStyle } from '@griffel/style-types';

import { resolveStyleRules, type ResolveStyleRulesOptions } from './runtime/resolveStyleRules.js';
import type { CSSClassesMapBySlot, CSSRulesByBucket, StyleBucketName, StylesBySlots } from './types.js';

export function resolveStyleRulesForSlots<Slots extends string | number>(
  stylesBySlots: StylesBySlots<Slots>,
  classNameHashSalt: string = '',
  options: ResolveStyleRulesOptions = {},
): [CSSClassesMapBySlot<Slots>, CSSRulesByBucket] {
  const classesMapBySlot = {} as CSSClassesMapBySlot<Slots>;
  const cssRules: CSSRulesByBucket = {};

  // eslint-disable-next-line guard-for-in
  for (const slotName in stylesBySlots) {
    const slotStyles: GriffelStyle = stylesBySlots[slotName];
    const [cssClassMap, cssRulesByBucket] = resolveStyleRules(
      slotStyles,
      classNameHashSalt,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      options,
    );

    classesMapBySlot[slotName] = cssClassMap;

    (Object.keys(cssRulesByBucket) as StyleBucketName[]).forEach(styleBucketName => {
      cssRules[styleBucketName] = (cssRules[styleBucketName] || []).concat(cssRulesByBucket[styleBucketName]!);
    });
  }

  return [classesMapBySlot, cssRules];
}
```

- [ ] **Step 2: Update `resolveResetStyleRules` to accept and forward options**

Open `packages/core/src/runtime/resolveResetStyleRules.ts`. Locate the exported function `resolveResetStyleRules`. Add a trailing optional `options` parameter to it and to any internal helpers in the same file that call `resolveStyleRules`. At each `resolveStyleRules(...)` call inside this file, pass `options` as the trailing arg.

The exact signature change at the top of the function:

```ts
import { resolveStyleRules, type ResolveStyleRulesOptions } from './resolveStyleRules.js';

export function resolveResetStyleRules(
  styles: GriffelStyle,
  classNameHashSalt: string = '',
  options: ResolveStyleRulesOptions = {},
): [string, string | null, CSSRulesByBucket] {
  // … existing body …
  // Where it calls resolveStyleRules(styles, classNameHashSalt, …):
  //   add `, options` as the trailing arg, matching resolveStyleRules' new signature.
}
```

(Read the current file before editing — the body has multiple branches; only the function's external signature and the `resolveStyleRules(...)` call sites need to change.)

- [ ] **Step 3: Run the affected tests**

```sh
yarn nx run @griffel/core:test
```

Expected: all tests pass; no regression.

- [ ] **Step 4: Commit**

```sh
git add packages/core/src/resolveStyleRulesForSlots.ts \
        packages/core/src/runtime/resolveResetStyleRules.ts
git commit -m "feat(core): forward bucketStrategy through slot and reset resolvers

Threads ResolveStyleRulesOptions through resolveStyleRulesForSlots
and resolveResetStyleRules so build-time callers can opt into the
extended bucket strategy."
```

---

## Task 4: Add `bucketStrategy` to `transformSync` options

**Files:**
- Modify: `packages/transform/src/transformSync.mts`
- Modify: `packages/transform/src/transformSync.test.mts` (or the nearest existing test file in `packages/transform/`)

`transformSync` is the entry point used by the webpack-plugin loader. It currently calls `resolveStyleRulesForSlots` and `resolveResetStyleRules` directly when a `makeStyles` / `makeResetStyles` call is encountered. We add an option to its `TransformOptions` and forward to those calls.

- [ ] **Step 1: Add a failing test that asserts the bucket strategy is honored**

Find the existing transform tests in `packages/transform/src/`. Locate one that snapshots or asserts `cssRulesByBucket` for a `makeStyles` call (e.g., `transformSync.test.mts` if present, or the closest equivalent). Add a new test that compiles a fixture with `& .foo:hover` and expects bucket `'h'` under `bucketStrategy: 'extended'`:

```ts
it('extended bucket strategy moves nested pseudos into their pseudo bucket', () => {
  const source = `
    import { makeStyles } from '@griffel/react';
    export const useStyles = makeStyles({
      root: { '& .foo:hover': { color: 'red' } },
    });
  `;
  const result = transformSync(source, {
    filename: '/virtual/test.ts',
    resolveModule: () => ({ path: '/dev/null' }),
    bucketStrategy: 'extended',
  });
  expect(result.cssRulesByBucket?.h?.length ?? 0).toBeGreaterThan(0);
  expect(result.cssRulesByBucket?.d?.length ?? 0).toBe(0);
});
```

If no test file currently exists where this fits, create `packages/transform/src/transformSync.bucket-strategy.test.mts` with the test above, plus the necessary imports:

```ts
import { describe, it, expect } from 'vitest';
import { transformSync } from './transformSync.mjs';
```

- [ ] **Step 2: Run the test and verify it fails**

```sh
yarn nx run @griffel/transform:test --testPathPattern bucket-strategy
```

Expected: fails because `bucketStrategy` isn't on `TransformOptions` (TS error) and the resolved buckets put the rule in `d`.

- [ ] **Step 3: Add `bucketStrategy` to `TransformOptions` and forward**

In `packages/transform/src/transformSync.mts`:

Add to the `TransformOptions` type (around line 26):

```ts
  /**
   * Controls how rule selectors map to style buckets at extraction time.
   * - 'leading' (default): preserves historical Griffel behavior.
   * - 'extended': bucketizes nested-pseudo selectors (e.g. '& .foo:hover')
   *   into their pseudo bucket so the layered output mode produces a
   *   correct cascade.
   */
  bucketStrategy?: 'leading' | 'extended';
```

Inside `transformSync`, locate the two `resolve*` call sites (currently at lines 349 and 366) and forward the option. The existing calls look like:

```ts
const [classnamesMapping, resolvedCSSRules] = resolveStyleRulesForSlots(stylesBySlots, classNameHashSalt);
// …
const [ltrClassName, rtlClassName, cssRules] = resolveResetStyleRules(styles, classNameHashSalt);
```

Update them to:

```ts
const [classnamesMapping, resolvedCSSRules] = resolveStyleRulesForSlots(stylesBySlots, classNameHashSalt, {
  bucketStrategy: options.bucketStrategy,
});
// …
const [ltrClassName, rtlClassName, cssRules] = resolveResetStyleRules(styles, classNameHashSalt, {
  bucketStrategy: options.bucketStrategy,
});
```

- [ ] **Step 4: Run the test and verify it passes**

```sh
yarn nx run @griffel/transform:test --testPathPattern bucket-strategy
```

Expected: PASS.

- [ ] **Step 5: Commit**

```sh
git add packages/transform/src/transformSync.mts \
        packages/transform/src/transformSync.bucket-strategy.test.mts
git commit -m "feat(transform): add bucketStrategy option to transformSync

Forwards a new bucketStrategy option to resolveStyleRulesForSlots
and resolveResetStyleRules so callers of @griffel/transform can
extract atomic CSS using the extended bucket assignment."
```

---

## Task 5: Add a `layerNames` helper module

**Files:**
- Create: `packages/webpack-plugin/src/utils/layerNames.mts`
- Create: `packages/webpack-plugin/src/utils/layerNames.test.mts`

Pure helpers shared between the loader (placeholder emission) and the plugin (placeholder substitution).

- [ ] **Step 1: Write the failing tests**

Create `packages/webpack-plugin/src/utils/layerNames.test.mts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  bucketLayerName,
  mediaPlaceholder,
  containerPlaceholder,
  hashOfQuery,
  GRIFFEL_LAYER_NAMESPACE,
} from './layerNames.mjs';

describe('layerNames', () => {
  it('builds bucket layer names without priority', () => {
    expect(bucketLayerName('d')).toBe('griffel.d');
    expect(bucketLayerName('h')).toBe('griffel.h');
  });

  it('encodes priority via the .s<n> sub-layer when non-zero', () => {
    expect(bucketLayerName('d', -1)).toBe('griffel.d.s-1');
    expect(bucketLayerName('d', -2)).toBe('griffel.d.s-2');
    expect(bucketLayerName('d', 0)).toBe('griffel.d');
  });

  it('produces a stable hash for the same query string', () => {
    expect(hashOfQuery('(min-width: 800px)')).toBe(hashOfQuery('(min-width: 800px)'));
    expect(hashOfQuery('(min-width: 800px)')).not.toBe(hashOfQuery('(min-width: 1200px)'));
  });

  it('mediaPlaceholder produces a valid CSS ident', () => {
    const ident = mediaPlaceholder('(min-width: 800px)');
    expect(ident).toMatch(/^griffel\.m\.__griffelmq_[a-z0-9]+__$/);
  });

  it('containerPlaceholder uses a distinct prefix', () => {
    const ident = containerPlaceholder('(width > 600px)');
    expect(ident).toMatch(/^griffel\.c\.__griffelcq_[a-z0-9]+__$/);
  });

  it('GRIFFEL_LAYER_NAMESPACE is the namespace for declarations', () => {
    expect(GRIFFEL_LAYER_NAMESPACE).toBe('griffel');
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

```sh
yarn nx run @griffel/webpack-plugin:test --testPathPattern layerNames
```

Expected: file not found / import errors.

- [ ] **Step 3: Implement the helper**

Create `packages/webpack-plugin/src/utils/layerNames.mts`:

```ts
import hashString from '@emotion/hash';
import type { StyleBucketName } from '@griffel/core';

export const GRIFFEL_LAYER_NAMESPACE = 'griffel';

const MEDIA_PLACEHOLDER_PREFIX = '__griffelmq_';
const CONTAINER_PLACEHOLDER_PREFIX = '__griffelcq_';
const PLACEHOLDER_SUFFIX = '__';
const HASH_LENGTH = 8;

export function hashOfQuery(query: string): string {
  return hashString(query).slice(0, HASH_LENGTH);
}

export function bucketLayerName(bucket: StyleBucketName, priority?: number): string {
  if (priority !== undefined && priority !== 0) {
    return `${GRIFFEL_LAYER_NAMESPACE}.${bucket}.s${priority}`;
  }
  return `${GRIFFEL_LAYER_NAMESPACE}.${bucket}`;
}

export function mediaPlaceholder(query: string): string {
  return `${GRIFFEL_LAYER_NAMESPACE}.m.${MEDIA_PLACEHOLDER_PREFIX}${hashOfQuery(query)}${PLACEHOLDER_SUFFIX}`;
}

export function containerPlaceholder(query: string): string {
  return `${GRIFFEL_LAYER_NAMESPACE}.c.${CONTAINER_PLACEHOLDER_PREFIX}${hashOfQuery(query)}${PLACEHOLDER_SUFFIX}`;
}

/**
 * Regex used by the asset-time pass to find and replace placeholders.
 * Captures the hash so callers can map it to its q<N> index.
 */
export const MEDIA_PLACEHOLDER_RE =
  /__griffelmq_([a-z0-9]+)__/g;
export const CONTAINER_PLACEHOLDER_RE =
  /__griffelcq_([a-z0-9]+)__/g;
```

- [ ] **Step 4: Run the tests and verify they pass**

```sh
yarn nx run @griffel/webpack-plugin:test --testPathPattern layerNames
```

Expected: PASS.

- [ ] **Step 5: Commit**

```sh
git add packages/webpack-plugin/src/utils/layerNames.mts \
        packages/webpack-plugin/src/utils/layerNames.test.mts
git commit -m "feat(webpack-plugin): add layer-name helpers for layered output

Pure helpers used by the loader to emit @layer wrappers and by the
plugin's processAssets pass to substitute media/container placeholders."
```

---

## Task 6: Extend `generateCSSRules` with `wrapInLayer`

**Files:**
- Modify: `packages/webpack-plugin/src/utils/generateCSSRules.mts`
- Create: `packages/webpack-plugin/src/utils/generateCSSRules.test.mts`

When `wrapInLayer: true`, every `/** @griffel:css-start [bucket] {meta} **/ … /** @griffel:css-end **/` block has its rules (but not the marker comments) wrapped in `@layer <name> { … }`.

- [ ] **Step 1: Write the failing tests**

Create `packages/webpack-plugin/src/utils/generateCSSRules.test.mts`:

```ts
import { describe, it, expect } from 'vitest';
import type { CSSRulesByBucket } from '@griffel/core';
import { generateCSSRules } from './generateCSSRules.mjs';

describe('generateCSSRules', () => {
  const sample: CSSRulesByBucket = {
    d: ['.f1{color:red}', ['.f2{padding:10px}', { p: -1 }]],
    h: ['.f3:hover{color:blue}'],
    m: [['.f4{color:orange}', { m: '(min-width: 800px)' }]],
  };

  it('emits markers around each bucket-entry block by default', () => {
    const css = generateCSSRules(sample);
    expect(css).toContain('/** @griffel:css-start [d] null **/');
    expect(css).toContain('/** @griffel:css-start [d] {"p":-1} **/');
    expect(css).toContain('/** @griffel:css-end **/');
    // No @layer in default mode.
    expect(css).not.toContain('@layer');
  });

  it("wraps each block in @layer when wrapInLayer is true", () => {
    const css = generateCSSRules(sample, { wrapInLayer: true });
    // Marker comments stay outside the wrapper.
    expect(css).toMatch(/\/\*\* @griffel:css-start \[d\] null \*\*\/\s*\n\s*@layer griffel\.d \{/);
    expect(css).toMatch(/\/\*\* @griffel:css-start \[d\] \{"p":-1\} \*\*\/\s*\n\s*@layer griffel\.d\.s-1 \{/);
    expect(css).toMatch(/\/\*\* @griffel:css-start \[h\] null \*\*\/\s*\n\s*@layer griffel\.h \{/);
    // Media block uses a placeholder layer.
    expect(css).toMatch(
      /\/\*\* @griffel:css-start \[m\] \{"m":"\(min-width: 800px\)"\} \*\*\/\s*\n\s*@layer griffel\.m\.__griffelmq_[a-z0-9]+__ \{/,
    );
    // The end markers still close blocks.
    expect((css.match(/@griffel:css-end/g) ?? []).length).toBe(4);
    // The @layer block is closed with a single } before each end marker.
    expect(css).toMatch(/\}\s*\/\*\* @griffel:css-end \*\*\//);
  });
});
```

- [ ] **Step 2: Run and verify failure**

```sh
yarn nx run @griffel/webpack-plugin:test --testPathPattern generateCSSRules
```

Expected: tests fail (the existing `generateCSSRules` ignores the second argument).

- [ ] **Step 3: Implement the new mode**

Replace the contents of `packages/webpack-plugin/src/utils/generateCSSRules.mts` with:

```ts
import { type CSSRulesByBucket, normalizeCSSBucketEntry, type StyleBucketName } from '@griffel/core';

import { bucketLayerName, mediaPlaceholder, containerPlaceholder } from './layerNames.mjs';

export type GenerateCSSRulesOptions = {
  /**
   * When true, each block of rules between @griffel:css-start /
   * @griffel:css-end markers is wrapped in `@layer <name> { … }`.
   * The markers themselves stay outside the wrapper so the asset-time
   * parser still sees them at the top level.
   */
  wrapInLayer?: boolean;
};

function layerNameForEntry(
  bucket: StyleBucketName,
  metadata: Record<string, unknown> | undefined,
): string {
  const priority = metadata && typeof metadata['p'] === 'number' ? (metadata['p'] as number) : undefined;
  const media = metadata && typeof metadata['m'] === 'string' ? (metadata['m'] as string) : undefined;

  if (bucket === 'm' && media) {
    return mediaPlaceholder(media);
  }

  // Container query metadata is not currently emitted by @griffel/core; when it
  // is, callers can pass a `c` field on metadata to keep this path symmetric.
  const container =
    metadata && typeof (metadata as Record<string, unknown>)['c'] === 'string'
      ? ((metadata as Record<string, unknown>)['c'] as string)
      : undefined;
  if (bucket === 'c' && container) {
    return containerPlaceholder(container);
  }

  return bucketLayerName(bucket, priority);
}

export function generateCSSRules(
  cssRulesByBucket: CSSRulesByBucket,
  options: GenerateCSSRulesOptions = {},
): string {
  const entries = Object.entries(cssRulesByBucket);

  if (entries.length === 0) {
    return '';
  }

  const wrap = options.wrapInLayer === true;
  const cssLines: string[] = [];

  type ActiveBlock = { entryKey: string; bucket: StyleBucketName; metadata?: Record<string, unknown> };
  let active: ActiveBlock | null = null;

  function closeActive() {
    if (!active) return;
    if (wrap) {
      cssLines.push('}');
    }
    cssLines.push('/** @griffel:css-end **/');
    active = null;
  }

  for (const [cssBucketName, cssBucketEntries] of entries) {
    const bucket = cssBucketName as StyleBucketName;
    for (const bucketEntry of cssBucketEntries!) {
      const [cssRule, metadata] = normalizeCSSBucketEntry(bucketEntry);

      const metadataAsJSON = JSON.stringify(metadata ?? null);
      const entryKey = `${bucket}-${metadataAsJSON}`;

      if (!active || active.entryKey !== entryKey) {
        closeActive();
        cssLines.push(`/** @griffel:css-start [${bucket}] ${metadataAsJSON} **/`);
        if (wrap) {
          cssLines.push(`@layer ${layerNameForEntry(bucket, metadata)} {`);
        }
        active = { entryKey, bucket, metadata };
      }

      cssLines.push(cssRule);
    }
  }

  closeActive();

  return cssLines.join('\n');
}
```

- [ ] **Step 4: Run the tests and verify they pass**

```sh
yarn nx run @griffel/webpack-plugin:test --testPathPattern generateCSSRules
```

Expected: PASS.

- [ ] **Step 5: Commit**

```sh
git add packages/webpack-plugin/src/utils/generateCSSRules.mts \
        packages/webpack-plugin/src/utils/generateCSSRules.test.mts
git commit -m "feat(webpack-plugin): wrap emitted rules in @layer when requested

Adds a wrapInLayer mode to generateCSSRules. Each block between
@griffel:css-start / @griffel:css-end markers is wrapped in
@layer griffel.<bucket>[.s<priority>][.<placeholder>] { ... }, with
marker comments staying outside the wrapper so the asset-time parser
continues to find them at the top level."
```

---

## Task 7: Wire the loader to emit layered output

**Files:**
- Modify: `packages/webpack-plugin/src/constants.mts`
- Modify: `packages/webpack-plugin/src/webpackLoader.mts`

The loader gets the layered-output state from the plugin via the loader context (`SupplementedLoaderContext`).

- [ ] **Step 1: Extend the loader context type**

In `packages/webpack-plugin/src/constants.mts`, find the `SupplementedLoaderContext` definition. Add two fields to the inner type associated with `GriffelCssLoaderContextKey`:

```ts
  /** Build-time bucket assignment strategy passed through to @griffel/transform. */
  bucketStrategy?: 'leading' | 'extended';
  /** When true, generateCSSRules wraps each emitted block in @layer. */
  wrapInLayer?: boolean;
```

(Keep all other existing fields intact.)

- [ ] **Step 2: Pass the new context fields into `transformSync` and `generateCSSRules`**

In `packages/webpack-plugin/src/webpackLoader.mts`, locate the `transformSync` call (around line 55 — `result = transformSync(sourceCode, { … })`). Add `bucketStrategy: this[GriffelCssLoaderContextKey]?.bucketStrategy` to the options object.

Locate the `generateCSSRules(resolvedCssRulesByBucket)` call (around line 85). Replace with:

```ts
const css = generateCSSRules(resolvedCssRulesByBucket, {
  wrapInLayer: this[GriffelCssLoaderContextKey]?.wrapInLayer === true,
});
```

- [ ] **Step 3: Quick smoke check**

```sh
yarn nx run @griffel/webpack-plugin:type-check
yarn nx run @griffel/webpack-plugin:test
```

Expected: no type or test regressions. (No new tests yet — they come in Task 9.)

- [ ] **Step 4: Commit**

```sh
git add packages/webpack-plugin/src/constants.mts \
        packages/webpack-plugin/src/webpackLoader.mts
git commit -m "feat(webpack-plugin): plumb bucketStrategy and wrapInLayer to loader

Reads the layered-output flags from the loader context and forwards
them to transformSync and generateCSSRules."
```

---

## Task 8: Add the `unstable_layeredOutput` plugin option (no aggregation yet)

**Files:**
- Modify: `packages/webpack-plugin/src/GriffelPlugin.mts`

Add the option, set the loader-context flags, skip the SplitChunks injection and the chunk-merge fallback when the flag is on, and throw on `unstable_attachToEntryPoint` + `unstable_layeredOutput` together.

The asset-time aggregation/manifest emission is added in Task 9 — for now the existing `processAssets` stays in place but it will no-op naturally when there is no `'griffel'` named chunk.

- [ ] **Step 1: Add the option to `GriffelCSSExtractionPluginOptions`**

In `packages/webpack-plugin/src/GriffelPlugin.mts`, add to the existing `GriffelCSSExtractionPluginOptions` type:

```ts
  /**
   * Emits Griffel CSS in CSS-cascade-layer form so that webpack's default
   * SplitChunks chunking can split the output into multiple files without
   * breaking cascade order.
   *
   * Mutually exclusive with `unstable_attachToEntryPoint`.
   * @default false
   */
  unstable_layeredOutput?: boolean;
```

- [ ] **Step 2: Store the flag and add the mutual-exclusion check**

Add a private field next to the existing private fields in the `GriffelPlugin` class:

```ts
  readonly #layeredOutput: boolean;
```

In the constructor, after the existing assignments:

```ts
    this.#layeredOutput = options.unstable_layeredOutput ?? false;

    if (this.#layeredOutput && options.unstable_attachToEntryPoint) {
      throw new Error(
        '@griffel/webpack-plugin: "unstable_layeredOutput" is incompatible with "unstable_attachToEntryPoint". Use one or the other.',
      );
    }
```

- [ ] **Step 3: Wire the loader-context flags**

Inside `apply()`, locate the `NormalModule.getCompilationHooks(compilation).loader.tap(...)` block where `loaderContext[GriffelCssLoaderContextKey] = { ... }` is set. Add `bucketStrategy` and `wrapInLayer` fields to that object:

```ts
        (loaderContext as SupplementedLoaderContext)[GriffelCssLoaderContextKey] = {
          collectPerfIssues: this.#collectPerfIssues,
          resolveModule,
          // … existing fields …
          bucketStrategy: this.#layeredOutput ? 'extended' : 'leading',
          wrapInLayer: this.#layeredOutput,
        };
```

- [ ] **Step 4: Skip cache-group injection and the chunk-merge fallback when layered**

Find the existing block that injects the SplitChunks cache group:

```ts
    if (compiler.options.optimization.splitChunks) {
      compiler.options.optimization.splitChunks.cacheGroups ??= {};
      compiler.options.optimization.splitChunks.cacheGroups['griffel'] = { … };
    }
```

Wrap it in `if (!this.#layeredOutput) { … }` so it does not run when the new flag is on.

Find the `if (!compiler.options.optimization.splitChunks)` block that registers `moveCSSModulesToGriffelChunk` via `compilation.hooks.optimizeChunks.tap(...)`. Wrap that block in `if (!this.#layeredOutput)` as well.

- [ ] **Step 5: Smoke check**

```sh
yarn nx run @griffel/webpack-plugin:type-check
yarn nx run @griffel/webpack-plugin:test
```

Expected: no regressions. The plugin still passes its existing tests (which exercise the default flag-off path).

- [ ] **Step 6: Commit**

```sh
git add packages/webpack-plugin/src/GriffelPlugin.mts
git commit -m "feat(webpack-plugin): add unstable_layeredOutput plugin option

Adds the opt-in flag, plumbs it to the loader context, and skips the
forced 'griffel' SplitChunks cache group + chunk-merge fallback when
the flag is on. Throws when combined with unstable_attachToEntryPoint."
```

---

## Task 9: Asset-time manifest emission and placeholder substitution

**Files:**
- Modify: `packages/webpack-plugin/src/GriffelPlugin.mts`
- Modify: `packages/webpack-plugin/src/GriffelPlugin.test.mts`

This task replaces the existing single-chunk-only `processAssets` pass with a multi-chunk-aware pass that runs only when `unstable_layeredOutput` is on. The flag-off path is unchanged.

- [ ] **Step 1: Write the failing integration tests**

In `packages/webpack-plugin/src/GriffelPlugin.test.mts`, add a new `describe` block (placed alongside the existing test cases) that compiles a fixture with two entries plus a shared module, with `unstable_layeredOutput: true`. The fixture content can be inline strings written to a temp dir using the existing memfs setup; reuse the helpers already in the file. The assertions:

```ts
describe('unstable_layeredOutput', () => {
  it('emits a layer manifest, wraps rules in @layer, and assigns indexed media-query layers across chunks', async () => {
    // Write two entries that import a shared module, each defining a different
    // @media query so the asset-time pass must reconcile them across chunks.

    // …(use the existing test scaffolding to compile two entries with
    //   pluginOptions = { unstable_layeredOutput: true } and a webpackConfig
    //   that enables splitChunks with chunks: 'all' and minSize: 0)…

    // 1. There must be no single 'griffel.css' asset; instead, multiple
    //    .css assets must be emitted.
    expect(filesList.filter(f => f.endsWith('.css')).length).toBeGreaterThan(1);

    // 2. Every emitted CSS asset starts with the same @layer manifest.
    const manifestRe = /^@layer\s+griffel\.r,/;
    for (const cssFile of filesList.filter(f => f.endsWith('.css'))) {
      const css = await readAsset(cssFile);
      expect(css).toMatch(manifestRe);
      // The manifest must mention every bucket layer.
      for (const bucket of ['r', 'd', 'l', 'v', 'w', 'f', 'i', 'h', 'a', 's', 'k', 't', 'm', 'c']) {
        expect(css).toContain(`griffel.${bucket}`);
      }
    }

    // 3. No `__griffelmq_` placeholder should remain in any asset; they must
    //    have been substituted with `q<N>` indices.
    for (const cssFile of filesList.filter(f => f.endsWith('.css'))) {
      const css = await readAsset(cssFile);
      expect(css).not.toMatch(/__griffelmq_/);
      expect(css).not.toMatch(/__griffelcq_/);
    }

    // 4. Two distinct @media queries should appear as `griffel.m.q0` and
    //    `griffel.m.q1` ordered by compareMediaQueries.
    //    (The fixture should define `(min-width: 800px)` and
    //    `(min-width: 1200px)` so q0 is the smaller breakpoint.)
    const anyAssetWithMedia = (await Promise.all(
      filesList.filter(f => f.endsWith('.css')).map(readAsset),
    )).find(c => /@media \(min-width: 800px\)/.test(c))!;
    expect(anyAssetWithMedia).toMatch(/@layer griffel\.m\.q0\s*\{[^}]*@media \(min-width: 800px\)/);
  });

  it('does not emit @layer wrappers when the flag is off (default behavior preserved)', async () => {
    // Compile the same fixture with pluginOptions = {} and assert there is
    // exactly one griffel.css asset and no '@layer ' substring inside it.
    expect(filesList.filter(f => f.endsWith('.css'))).toEqual(['griffel.css']);
    const css = await readAsset('griffel.css');
    expect(css).not.toContain('@layer ');
  });

  it('throws when combined with unstable_attachToEntryPoint', () => {
    // Constructing the plugin with both options must throw synchronously.
    expect(
      () =>
        new GriffelPlugin({
          unstable_layeredOutput: true,
          unstable_attachToEntryPoint: 'main',
        }),
    ).toThrow(/unstable_layeredOutput.*unstable_attachToEntryPoint/);
  });
});
```

The exact wiring of `filesList` / `readAsset` mirrors what existing tests in `GriffelPlugin.test.mts` already do — read the existing helpers first and reuse them. If the existing helpers only support a single entry, adapt `compileSourceWithWebpack` (lines 47-130) to accept an `entryPaths` map and to read multiple resulting CSS assets out of the memfs volume.

- [ ] **Step 2: Run the new tests and verify failure**

```sh
yarn nx run @griffel/webpack-plugin:test --testPathPattern GriffelPlugin
```

Expected: the new `describe` block fails — the asset-time pass still operates on a single `'griffel'` named chunk that doesn't exist when the flag is on.

- [ ] **Step 3: Implement the manifest pass**

In `packages/webpack-plugin/src/GriffelPlugin.mts`, near the top, add imports:

```ts
import {
  GRIFFEL_LAYER_NAMESPACE,
  MEDIA_PLACEHOLDER_RE,
  CONTAINER_PLACEHOLDER_RE,
  hashOfQuery,
} from './utils/layerNames.mjs';
```

Add a helper near the top of the file (above the `GriffelPlugin` class):

```ts
const STATIC_BUCKET_LAYERS = [
  'r',
  // d sub-layers in priority order: most-shorthandy first.
  'd.s-2',
  'd.s-1',
  'd',
  'l',
  'v',
  'w',
  'f',
  'i',
  'h',
  'a',
  's',
  'k',
  't',
];

function isGriffelCssAsset(content: string): boolean {
  return content.indexOf('/** @griffel:css-start') !== -1;
}

function buildLayerManifest(
  mediaQueriesSorted: string[],
  containerQueriesSorted: string[],
): string {
  const parts: string[] = [...STATIC_BUCKET_LAYERS.map(seg => `${GRIFFEL_LAYER_NAMESPACE}.${seg}`)];

  for (let i = 0; i < mediaQueriesSorted.length; i++) {
    parts.push(`${GRIFFEL_LAYER_NAMESPACE}.m.q${i}`);
  }
  for (let i = 0; i < containerQueriesSorted.length; i++) {
    parts.push(`${GRIFFEL_LAYER_NAMESPACE}.c.q${i}`);
  }

  return `@layer ${parts.join(', ')};\n`;
}
```

Locate the `compilation.hooks.processAssets.tap(...)` block in `apply()`. Replace the body of that tap with branches by `this.#layeredOutput`:

```ts
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        assets => {
          if (this.#layeredOutput) {
            // Multi-chunk layered pass.
            const griffelAssets: Array<[string, string]> = [];
            for (const [name, source] of Object.entries(assets)) {
              if (!name.endsWith('.css')) continue;
              const content = getAssetSourceContents(source);
              if (!isGriffelCssAsset(content)) continue;
              griffelAssets.push([name, content]);
            }
            if (griffelAssets.length === 0) {
              return;
            }

            // Aggregate the union set of media + container queries across all
            // griffel-bearing assets.
            const mediaSet = new Set<string>();
            const containerSet = new Set<string>();
            for (const [, content] of griffelAssets) {
              const { cssRulesByBucket } = parseCSSRules(content);
              for (const entry of cssRulesByBucket.m ?? []) {
                const [, meta] = Array.isArray(entry) ? entry : [entry, undefined];
                const m = meta && typeof meta['m'] === 'string' ? meta['m'] : undefined;
                if (m) mediaSet.add(m);
              }
              for (const entry of cssRulesByBucket.c ?? []) {
                const [, meta] = Array.isArray(entry) ? entry : [entry, undefined];
                const c = meta && typeof (meta as Record<string, unknown>)['c'] === 'string'
                  ? ((meta as Record<string, unknown>)['c'] as string)
                  : undefined;
                if (c) containerSet.add(c);
              }
            }

            const mediaSorted = Array.from(mediaSet).sort(this.#compareMediaQueries);
            const containerSorted = Array.from(containerSet).sort(this.#compareMediaQueries);

            const mediaIndexByHash = new Map<string, number>();
            mediaSorted.forEach((q, i) => mediaIndexByHash.set(hashOfQuery(q), i));
            const containerIndexByHash = new Map<string, number>();
            containerSorted.forEach((q, i) => containerIndexByHash.set(hashOfQuery(q), i));

            const manifest = buildLayerManifest(mediaSorted, containerSorted);

            for (const [name, content] of griffelAssets) {
              let rewritten = content.replace(MEDIA_PLACEHOLDER_RE, (_full, hash) => {
                const idx = mediaIndexByHash.get(hash);
                if (idx === undefined) return _full;
                return `q${idx}`;
              });
              rewritten = rewritten.replace(CONTAINER_PLACEHOLDER_RE, (_full, hash) => {
                const idx = containerIndexByHash.get(hash);
                if (idx === undefined) return _full;
                return `q${idx}`;
              });
              compilation.updateAsset(
                name,
                new compiler.webpack.sources.RawSource(manifest + rewritten),
              );
            }
            return;
          }

          // Legacy single-chunk pass (unchanged).
          const griffelChunk = compilation.namedChunks.get('griffel');
          if (typeof griffelChunk === 'undefined') {
            return;
          }
          const cssAssetDetails = Object.entries(assets).find(([assetName]) =>
            griffelChunk.files.has(assetName),
          );
          if (typeof cssAssetDetails === 'undefined') {
            return;
          }
          const [cssAssetName, cssAssetSource] = cssAssetDetails;
          const cssContent = getAssetSourceContents(cssAssetSource);
          const { cssRulesByBucket, remainingCSS } = parseCSSRules(cssContent);
          const cssSource = sortCSSRules([cssRulesByBucket], this.#compareMediaQueries);
          compilation.updateAsset(
            cssAssetName,
            new compiler.webpack.sources.RawSource(remainingCSS + cssSource),
          );
        },
      );
```

- [ ] **Step 4: Run the tests and verify they pass**

```sh
yarn nx run @griffel/webpack-plugin:test --testPathPattern GriffelPlugin
```

Expected: PASS, including the new `unstable_layeredOutput` describe block.

- [ ] **Step 5: Run the full plugin suite as a smoke check**

```sh
yarn nx run @griffel/webpack-plugin:test
yarn nx run @griffel/webpack-plugin:type-check
```

Expected: no regressions.

- [ ] **Step 6: Commit**

```sh
git add packages/webpack-plugin/src/GriffelPlugin.mts \
        packages/webpack-plugin/src/GriffelPlugin.test.mts
git commit -m "feat(webpack-plugin): emit cross-chunk @layer manifest in layered mode

Adds a processAssets pass that, when unstable_layeredOutput is on,
walks every griffel-bearing CSS asset, aggregates the union set of
@media / @container queries, sorts them with compareMediaQueries,
emits a global manifest at the top of every asset, and substitutes
hash placeholders with indexed q<N> layer names."
```

---

## Task 10: Add `--layered` mode to the chunking-repro

**Files:**
- Modify: `apps/chunking-repro/build.mjs`
- Modify: `apps/chunking-repro/serve.mjs`
- Modify: `apps/chunking-repro/project.json`
- Modify: `apps/chunking-repro/README.md`

The repro now has three modes: `default` (current behavior), `split` (broken cascade demo), and `layered` (new behavior).

- [ ] **Step 1: Rebuild the affected packages**

After Tasks 1–9 land, the dist used by the repro must be refreshed:

```sh
yarn nx run @griffel/core:build
yarn nx run @griffel/transform:build
yarn nx run @griffel/webpack-plugin:build
```

- [ ] **Step 2: Add `--layered` to `apps/chunking-repro/build.mjs`**

In `apps/chunking-repro/build.mjs`, replace the line `const split = process.argv.includes('--split');` with:

```js
const layered = process.argv.includes('--layered');
const split = !layered && process.argv.includes('--split');

const mode = layered ? 'layered' : split ? 'split' : 'default';
const outDir = path.resolve(rootDir, 'dist/apps/chunking-repro', mode);
```

Replace the existing `new GriffelPlugin()` instantiation with:

```js
    new GriffelPlugin({ unstable_layeredOutput: layered }),
```

Replace the existing trailing log line with:

```js
  console.log(`\nMode: ${mode.toUpperCase()}`);
  console.log(`Output: ${path.relative(rootDir, outDir)}`);
```

- [ ] **Step 3: Update `apps/chunking-repro/serve.mjs`**

In `apps/chunking-repro/serve.mjs`, replace `const split = process.argv.includes('--split');` with:

```js
const layered = process.argv.includes('--layered');
const split = !layered && process.argv.includes('--split');
const mode = layered ? 'layered' : split ? 'split' : 'default';
const root = path.resolve(__dirname, '..', '..', 'dist/apps/chunking-repro', mode);
```

- [ ] **Step 4: Add an Nx target**

In `apps/chunking-repro/project.json`, add a new `build:layered` target alongside the existing `build:split` target:

```json
    "build:layered": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "apps/chunking-repro",
        "commands": [{ "command": "node ./build.mjs --layered" }]
      },
      "outputs": ["{workspaceRoot}/dist/apps/chunking-repro"]
    },
```

- [ ] **Step 5: Run the layered build and inspect the output**

```sh
yarn nx run @griffel/chunking-repro:build:layered
```

Expected:
- Multiple CSS files emitted under `dist/apps/chunking-repro/layered/`.
- Each file starts with `@layer griffel.r, griffel.d.s-2, griffel.d.s-1, griffel.d, …`.
- Rules are wrapped in their bucket layer.
- No `__griffelmq_` placeholders remain.

Quick spot check:

```sh
head -2 dist/apps/chunking-repro/layered/page-a.css
head -2 dist/apps/chunking-repro/layered/page-b.css
grep -c '@layer griffel\.' dist/apps/chunking-repro/layered/*.css
grep -c '__griffel' dist/apps/chunking-repro/layered/*.css || true
```

Expected: every css file's first line is the manifest; the placeholder grep returns zero hits.

- [ ] **Step 6: Update the README**

Replace the existing build section in `apps/chunking-repro/README.md` with:

```markdown
## Build

```sh
# Default mode: GriffelPlugin's single-chunk forcing is on (current behavior).
node build.mjs

# Split mode: a tiny "DisableGriffelChunkMergePlugin" runs after GriffelPlugin
# and removes the forced 'griffel' SplitChunks cache group, letting webpack
# place each .griffel.css module in whichever chunk discovers it first.
node build.mjs --split

# Layered mode: GriffelPlugin runs with `unstable_layeredOutput: true`, so
# every emitted .griffel.css module is wrapped in @layer and a global layer
# manifest is prepended to every chunk's CSS asset.
node build.mjs --layered
```
```

Add a "What you see — Layered mode" subsection after the existing "Split mode" subsection:

```markdown
### Layered mode (`dist/apps/chunking-repro/layered/`)

Three (or more) CSS files. Each one begins with the same global manifest:

```css
@layer griffel.r, griffel.d.s-2, griffel.d.s-1, griffel.d,
       griffel.l, griffel.v, griffel.w, griffel.f, griffel.i, griffel.h, griffel.a,
       griffel.s, griffel.k, griffel.t,
       griffel.m.q0, griffel.m.q1, griffel.c;
```

Individual rules are wrapped in their layer (`@layer griffel.h { … }`,
`@layer griffel.m.q1 { @media (...) { … } }`). LVHA, shorthand→longhand
priority, and overlapping `@media` breakpoints all resolve via layer
order — independent of which CSS file the browser parses first.
```

- [ ] **Step 7: Commit**

```sh
git add apps/chunking-repro/build.mjs \
        apps/chunking-repro/serve.mjs \
        apps/chunking-repro/project.json \
        apps/chunking-repro/README.md
git commit -m "feat(chunking-repro): add --layered build mode

Wires the repro to the new unstable_layeredOutput plugin option so
the layered output can be inspected side-by-side with the default
and split modes."
```

---

## Verification gate

After Task 10, run these as a final smoke pass:

```sh
yarn nx run @griffel/core:test
yarn nx run @griffel/transform:test
yarn nx run @griffel/webpack-plugin:test
yarn nx run @griffel/webpack-plugin:type-check

# Re-run the existing e2e flag-off paths to confirm no regression.
yarn nx run @griffel/e2e-rspack:test
```

Expected: all green. The flag-off behavior is byte-identical to today; the flag-on behavior produces multi-chunk layered output with stable cross-chunk cascade.
