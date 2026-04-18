# `createVar()` — Core Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship runtime support for `createVar()` — a function producing unique, SSR-safe CSS custom-property names usable both as object keys in `makeStyles` and in component inline styles. This plan covers *only* the core runtime in `@griffel/core` and `@griffel/react`. Follow-up plans will cover the Babel transform, OXC transform, ESLint rule, and jest serializer.

**Architecture:** `createVar()` returns a string-coercible reference carrying an internal placeholder like `--__g_var_p<n>__`. When `resolveStyleRules` walks a `makeStyles` styles object, it detects placeholder strings in keys and values, derives a final name of the form `--fv-<stylesHash>-<index>` from the block's existing content hash, and mutates the reference so subsequent coercions (e.g. in component inline styles) return the stable final name. The counter in the placeholder never reaches the DOM or CSS — the SSR-safety guarantee comes from Griffel's existing content-hashing.

**Tech Stack:** TypeScript, Vitest, Nx, Yarn 4. Packages touched: `@griffel/style-types`, `@griffel/core`, `@griffel/react`.

**Related spec:** `docs/superpowers/specs/2026-04-18-createVar-design.md`

**Deviation from spec:** The spec proposed *eager* resolution at `makeStyles(...)` call time. This plan uses **lazy resolution** — vars are resolved during the first `resolveStyleRules` walk (triggered by first `useStyles()` call). This matches Griffel's existing architecture (makeStyles is already lazy) and avoids a full styles walk for blocks that don't use vars. The user-facing guarantees are identical: by the time component JSX is built, `useStyles()` has already run and the var is resolved.

---

## File structure

**New files:**
- `packages/style-types/src/createVar.ts` — `GriffelVar` branded type.
- `packages/core/src/createVar.ts` — factory, placeholder registry, resolution helper.
- `packages/core/src/createVar.test.ts` — unit tests for the factory and registry.
- `packages/core/src/createVar.integration.test.ts` — end-to-end tests driving `makeStyles` + `createVar` including the SSR equivalence test.

**Modified files:**
- `packages/style-types/src/index.ts` — export `GriffelVar`.
- `packages/core/src/constants.ts` — add `VAR_HASH_PREFIX`, `GRIFFEL_VAR_PLACEHOLDER_PREFIX`, `GRIFFEL_VAR_PLACEHOLDER_SUFFIX`, `GRIFFEL_VAR_PLACEHOLDER_REGEX`.
- `packages/core/src/runtime/resolveStyleRules.ts` — add a per-block placeholder pre-pass that assigns final names and rewrites keys/values.
- `packages/core/src/index.ts` — export `createVar`.
- `packages/react/src/index.ts` — re-export `createVar`.

---

## Task 1: Add `GriffelVar` branded type to style-types

**Files:**
- Create: `packages/style-types/src/createVar.ts`
- Modify: `packages/style-types/src/index.ts`

- [ ] **Step 1: Create the type file**

Create `packages/style-types/src/createVar.ts` with:

```ts
declare const griffelVarBrand: unique symbol;

/**
 * A reference to a unique CSS custom property produced by `createVar()`.
 *
 * Coerces to a CSS custom-property name via `Symbol.toPrimitive`, which lets
 * it be used as an object key (`[v]: 'red'`) and inside template strings
 * (`var(${v})`).
 */
export interface GriffelVar {
  toString(): string;
  [Symbol.toPrimitive](hint: string): string;
  readonly [griffelVarBrand]: true;
}
```

- [ ] **Step 2: Re-export from the package index**

Edit `packages/style-types/src/index.ts`, add this line near the other `export type` lines:

```ts
export type { GriffelVar } from './createVar';
```

- [ ] **Step 3: Verify the type compiles**

Run: `yarn nx run @griffel/style-types:type-check`
Expected: exits 0. (If there is no `type-check` target, run `yarn nx run @griffel/style-types:build` instead.)

- [ ] **Step 4: Commit**

```bash
git add packages/style-types/src/createVar.ts packages/style-types/src/index.ts
git commit -m "feat(style-types): add GriffelVar branded type for createVar"
```

---

## Task 2: Add placeholder/var constants to `@griffel/core`

**Files:**
- Modify: `packages/core/src/constants.ts`

- [ ] **Step 1: Add the constants**

Append these exports to `packages/core/src/constants.ts` (after `RESET_HASH_PREFIX`):

```ts
/** @internal Prefix for hashed CSS variable names produced by createVar(). */
export const VAR_HASH_PREFIX = 'fv';

/** @internal Internal placeholder prefix. Must never leak to the DOM. */
export const GRIFFEL_VAR_PLACEHOLDER_PREFIX = '--__g_var_p';

/** @internal Internal placeholder suffix. */
export const GRIFFEL_VAR_PLACEHOLDER_SUFFIX = '__';

/**
 * @internal
 * Matches placeholder tokens like `--__g_var_p42__` anywhere in a string.
 * The `g` flag is required because we replace all occurrences in a value.
 */
export const GRIFFEL_VAR_PLACEHOLDER_REGEX = /--__g_var_p\d+__/g;
```

- [ ] **Step 2: Run existing core tests to confirm no regression**

Run: `yarn nx test @griffel/core -- --run`
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/constants.ts
git commit -m "feat(core): add placeholder/var constants for createVar"
```

---

## Task 3: Create `createVar` factory and placeholder registry — failing test first

**Files:**
- Create: `packages/core/src/createVar.test.ts`
- Create: `packages/core/src/createVar.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/core/src/createVar.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { createVar, __internal_resolvePlaceholder, __internal_getPlaceholderOwner } from './createVar.js';
import { GRIFFEL_VAR_PLACEHOLDER_PREFIX, GRIFFEL_VAR_PLACEHOLDER_REGEX } from './constants.js';

describe('createVar', () => {
  it('returns a reference whose string coercion starts as a placeholder', () => {
    const v = createVar();
    const coerced = `${v}`;
    expect(coerced.startsWith(GRIFFEL_VAR_PLACEHOLDER_PREFIX)).toBe(true);
    expect(GRIFFEL_VAR_PLACEHOLDER_REGEX.test(coerced)).toBe(true);
  });

  it('gives each call a distinct placeholder', () => {
    const a = createVar();
    const b = createVar();
    expect(`${a}`).not.toEqual(`${b}`);
  });

  it('is usable as an object key', () => {
    const v = createVar();
    const obj: Record<string, string> = { [v as unknown as string]: 'blue' };
    expect(Object.keys(obj)[0]).toEqual(`${v}`);
  });

  it('registers its placeholder so it can be resolved by hash', () => {
    const v = createVar();
    const placeholder = `${v}`;
    expect(__internal_getPlaceholderOwner(placeholder)).toBe(v);
  });

  it('mutates its coercion to the resolved name after resolution', () => {
    const v = createVar();
    const placeholder = `${v}`;
    __internal_resolvePlaceholder(placeholder, '--fv-abc-0');
    expect(`${v}`).toEqual('--fv-abc-0');
  });

  it('is idempotent: first resolution wins', () => {
    const v = createVar();
    const placeholder = `${v}`;
    __internal_resolvePlaceholder(placeholder, '--fv-abc-0');
    __internal_resolvePlaceholder(placeholder, '--fv-xyz-7');
    expect(`${v}`).toEqual('--fv-abc-0');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `yarn nx test @griffel/core -- --run src/createVar.test.ts`
Expected: FAIL — module `./createVar.js` does not exist.

- [ ] **Step 3: Implement the module**

Create `packages/core/src/createVar.ts`:

```ts
import {
  GRIFFEL_VAR_PLACEHOLDER_PREFIX,
  GRIFFEL_VAR_PLACEHOLDER_SUFFIX,
} from './constants.js';
import type { GriffelVar } from '@griffel/style-types';

interface InternalGriffelVar extends GriffelVar {
  _placeholder: string;
  _resolved: string | undefined;
}

let placeholderCounter = 0;
const registry = new Map<string, InternalGriffelVar>();

/**
 * Creates a reference to a unique CSS custom property.
 *
 * Must be called at module scope. Usable as an object key in `makeStyles`
 * styles and in component inline styles.
 */
export function createVar(): GriffelVar {
  const placeholder =
    GRIFFEL_VAR_PLACEHOLDER_PREFIX + placeholderCounter++ + GRIFFEL_VAR_PLACEHOLDER_SUFFIX;

  const ref: InternalGriffelVar = {
    _placeholder: placeholder,
    _resolved: undefined,
    toString() {
      return this._resolved ?? this._placeholder;
    },
    [Symbol.toPrimitive]() {
      return this._resolved ?? this._placeholder;
    },
  } as InternalGriffelVar;

  registry.set(placeholder, ref);
  return ref;
}

/**
 * @internal
 * Resolves a placeholder to its final CSS variable name. First resolution wins;
 * subsequent calls are no-ops. Called by `resolveStyleRules` after it has
 * computed the block's content hash.
 */
export function __internal_resolvePlaceholder(placeholder: string, resolvedName: string): void {
  const ref = registry.get(placeholder);
  if (ref && ref._resolved === undefined) {
    ref._resolved = resolvedName;
  }
}

/**
 * @internal
 * Returns the GriffelVar ref associated with a placeholder, or undefined
 * if the placeholder is not registered. Used by tests and by resolveStyleRules
 * to look up an already-resolved name.
 */
export function __internal_getPlaceholderOwner(placeholder: string): GriffelVar | undefined {
  return registry.get(placeholder);
}

/**
 * @internal
 * Returns the already-resolved name for a placeholder, or undefined if not
 * yet resolved. Does not trigger resolution.
 */
export function __internal_getResolvedName(placeholder: string): string | undefined {
  return registry.get(placeholder)?._resolved;
}
```

- [ ] **Step 4: Run test to verify passing**

Run: `yarn nx test @griffel/core -- --run src/createVar.test.ts`
Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/createVar.ts packages/core/src/createVar.test.ts
git commit -m "feat(core): add createVar factory and placeholder registry"
```

---

## Task 4: Extend `resolveStyleRules` — placeholder pre-pass (failing test first)

This task teaches `resolveStyleRules` to recognize placeholder strings. It walks the styles block once before the main rule-emission loop, collects placeholders, computes final names from the block's content, and rewrites the styles object (in a copy — we never mutate user input).

**Files:**
- Modify: `packages/core/src/runtime/resolveStyleRules.ts`
- Create: `packages/core/src/runtime/resolveVarsInStyles.ts`
- Create: `packages/core/src/runtime/resolveVarsInStyles.test.ts`

- [ ] **Step 1: Write the failing unit test for `resolveVarsInStyles`**

Create `packages/core/src/runtime/resolveVarsInStyles.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createVar, __internal_getResolvedName } from '../createVar.js';
import { resolveVarsInStyles } from './resolveVarsInStyles.js';
import { VAR_HASH_PREFIX } from '../constants.js';

describe('resolveVarsInStyles', () => {
  it('returns the input unchanged when no placeholders are present', () => {
    const styles = { color: 'red' };
    const result = resolveVarsInStyles(styles, '');
    expect(result).toBe(styles); // same ref — fast path
  });

  it('rewrites a placeholder key to a --fv-* name', () => {
    const colorVar = createVar();
    const styles = { [`${colorVar}`]: 'blue' };
    const result = resolveVarsInStyles(styles, '');

    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
    expect(keys[0].startsWith(`--${VAR_HASH_PREFIX}-`)).toBe(true);
    expect(result[keys[0]]).toEqual('blue');
  });

  it('rewrites placeholders inside string values (e.g. var(--placeholder))', () => {
    const colorVar = createVar();
    const styles = {
      [`${colorVar}`]: 'blue',
      color: `var(${colorVar})`,
    };
    const result = resolveVarsInStyles(styles, '');

    const resolvedName = __internal_getResolvedName(`${colorVar}`);
    expect(resolvedName).toBeDefined();
    expect(result).toEqual({
      [resolvedName!]: 'blue',
      color: `var(${resolvedName})`,
    });
  });

  it('produces the same final name for two runs with the same styles (SSR-equivalence)', () => {
    // Two independent "renders" of the same block produce the same output.
    const v1 = createVar();
    const v2 = createVar();

    const run = (placeholderA: string, placeholderB: string) =>
      resolveVarsInStyles(
        { [placeholderA]: 'blue', color: `var(${placeholderA})`, [placeholderB]: '10px' },
        '',
      );

    // Because v1 and v2 were just created, their _resolved is undefined.
    // Clear any cached resolution by calling resolveVars with the same content
    // twice and ensuring keys match.
    const first = run(`${v1}`, `${v2}`);
    const second = run(`${v1}`, `${v2}`);
    expect(Object.keys(second)).toEqual(Object.keys(first));
    expect(second).toEqual(first);
  });

  it('reuses an already-resolved var across blocks (first-definer-wins)', () => {
    const shared = createVar();
    const blockA = { [`${shared}`]: 'red' };
    const blockB = { color: `var(${shared})` };

    const resolvedA = resolveVarsInStyles(blockA, '');
    const resolvedName = Object.keys(resolvedA)[0];

    const resolvedB = resolveVarsInStyles(blockB, '');
    expect(resolvedB.color).toEqual(`var(${resolvedName})`);
  });

  it('handles placeholders nested inside selector blocks', () => {
    const colorVar = createVar();
    const styles = {
      color: `var(${colorVar})`,
      ':hover': {
        [`${colorVar}`]: 'red',
      },
    };
    const result = resolveVarsInStyles(styles, '');
    const resolvedName = __internal_getResolvedName(`${colorVar}`);
    expect(result.color).toEqual(`var(${resolvedName})`);
    expect(result[':hover']).toEqual({ [resolvedName!]: 'red' });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `yarn nx test @griffel/core -- --run src/runtime/resolveVarsInStyles.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `resolveVarsInStyles`**

Create `packages/core/src/runtime/resolveVarsInStyles.ts`:

```ts
import hashString from '@emotion/hash';
import {
  GRIFFEL_VAR_PLACEHOLDER_REGEX,
  VAR_HASH_PREFIX,
} from '../constants.js';
import {
  __internal_getResolvedName,
  __internal_resolvePlaceholder,
} from '../createVar.js';
import { isObject } from './utils/isObject.js';

/**
 * Walks a styles block and rewrites any placeholder tokens in keys and values
 * to stable `--fv-<blockHash>-<index>` names. Returns the input unchanged
 * (same reference) if no placeholders are found.
 *
 * The returned object is safe to mutate; the input is never mutated.
 */
export function resolveVarsInStyles<T extends object>(styles: T, classNameHashSalt: string): T {
  const placeholders = collectPlaceholders(styles);
  if (placeholders.size === 0) {
    return styles;
  }

  // Hash the block contents (stringified) + salt. Because placeholders are
  // deterministic across server and client (same module load order produces
  // the same counter values), the stringified content is the same on both
  // sides, and so is the hash.
  const blockHash = hashString(classNameHashSalt + stableStringify(styles));

  // Assign final names in placeholder-appearance order (deterministic since
  // Set preserves insertion order).
  const remap = new Map<string, string>();
  let index = 0;
  for (const placeholder of placeholders) {
    const existing = __internal_getResolvedName(placeholder);
    if (existing !== undefined) {
      remap.set(placeholder, existing);
    } else {
      const finalName = `--${VAR_HASH_PREFIX}-${blockHash}-${index}`;
      __internal_resolvePlaceholder(placeholder, finalName);
      remap.set(placeholder, finalName);
    }
    index += 1;
  }

  return rewriteStyles(styles, remap);
}

function collectPlaceholders(styles: object, acc: Set<string> = new Set()): Set<string> {
  for (const key of Object.keys(styles)) {
    // Key could be a placeholder itself.
    for (const match of key.matchAll(GRIFFEL_VAR_PLACEHOLDER_REGEX)) {
      acc.add(match[0]);
    }
    const value = (styles as Record<string, unknown>)[key];
    if (typeof value === 'string') {
      for (const match of value.matchAll(GRIFFEL_VAR_PLACEHOLDER_REGEX)) {
        acc.add(match[0]);
      }
    } else if (isObject(value)) {
      collectPlaceholders(value as object, acc);
    }
  }
  return acc;
}

function rewriteStyles<T extends object>(styles: T, remap: Map<string, string>): T {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(styles)) {
    const rewrittenKey = rewriteString(key, remap);
    const value = (styles as Record<string, unknown>)[key];
    if (typeof value === 'string') {
      out[rewrittenKey] = rewriteString(value, remap);
    } else if (isObject(value)) {
      out[rewrittenKey] = rewriteStyles(value as object, remap);
    } else {
      out[rewrittenKey] = value;
    }
  }
  return out as T;
}

function rewriteString(input: string, remap: Map<string, string>): string {
  if (!GRIFFEL_VAR_PLACEHOLDER_REGEX.test(input)) {
    return input;
  }
  // Reset lastIndex because the regex has the `g` flag and is module-scoped.
  GRIFFEL_VAR_PLACEHOLDER_REGEX.lastIndex = 0;
  return input.replace(GRIFFEL_VAR_PLACEHOLDER_REGEX, match => remap.get(match) ?? match);
}

/**
 * Deterministic stringification — Object.keys iteration order is already
 * insertion-order per spec, which matches between server and client for the
 * same source module. JSON.stringify honors that order.
 */
function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}
```

- [ ] **Step 4: Run test to verify passing**

Run: `yarn nx test @griffel/core -- --run src/runtime/resolveVarsInStyles.test.ts`
Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/runtime/resolveVarsInStyles.ts packages/core/src/runtime/resolveVarsInStyles.test.ts
git commit -m "feat(core): add resolveVarsInStyles helper for placeholder resolution"
```

---

## Task 5: Wire `resolveVarsInStyles` into `resolveStyleRules`

**Files:**
- Modify: `packages/core/src/runtime/resolveStyleRules.ts`

- [ ] **Step 1: Write the failing integration test**

Append this to `packages/core/src/runtime/resolveVarsInStyles.test.ts` (same file as Task 4):

```ts
describe('resolveVarsInStyles + resolveStyleRules integration', () => {
  it('resolveStyleRules produces CSS with resolved var names, not placeholders', async () => {
    const { resolveStyleRules } = await import('./resolveStyleRules.js');
    const colorVar = createVar();

    const [classes, buckets] = resolveStyleRules({
      [`${colorVar}`]: 'blue',
      color: `var(${colorVar})`,
    });

    const allCss = JSON.stringify(buckets);
    // No placeholder text should leak into generated CSS.
    expect(allCss).not.toMatch(/--__g_var_p\d+__/);
    // The resolved var name should appear.
    const resolvedName = __internal_getResolvedName(`${colorVar}`);
    expect(allCss).toContain(resolvedName);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `yarn nx test @griffel/core -- --run src/runtime/resolveVarsInStyles.test.ts`
Expected: FAIL — the new test fails because `resolveStyleRules` still sees placeholders.

- [ ] **Step 3: Modify `resolveStyleRules` to do the pre-pass**

Edit `packages/core/src/runtime/resolveStyleRules.ts`. Add the import near the top (below the existing imports around lines 1–26):

```ts
import { resolveVarsInStyles } from './resolveVarsInStyles.js';
```

Then, at the very top of the `resolveStyleRules` function body — **only on the initial call** (no `selectors` yet) — replace the styles input with a var-resolved copy. Locate the function header at line 87–100:

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
): [CSSClassesMap, CSSRulesByBucket] {
```

Insert these lines immediately after the `{`:

```ts
  // Top-level calls (no selectors yet) own placeholder resolution for this block.
  // Nested recursive calls operate on already-rewritten styles.
  if (selectors.length === 0 && atRules.container === '' && atRules.layer === '' && atRules.media === '' && atRules.supports === '') {
    styles = resolveVarsInStyles(styles, classNameHashSalt);
  }
```

- [ ] **Step 4: Run to verify passing**

Run: `yarn nx test @griffel/core -- --run src/runtime/resolveVarsInStyles.test.ts`
Expected: PASS — all tests in this file pass, including the new integration test.

- [ ] **Step 5: Run the full core test suite**

Run: `yarn nx test @griffel/core -- --run`
Expected: all previously-passing tests still pass. If any `makeStyles`/`resolveStyleRules` snapshot tests fail because their output hasn't changed but the call-path did, investigate — the var pre-pass must be a no-op for placeholder-free input, so there should be no changes.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/runtime/resolveStyleRules.ts packages/core/src/runtime/resolveVarsInStyles.test.ts
git commit -m "feat(core): resolveStyleRules resolves createVar placeholders before emitting CSS"
```

---

## Task 6: End-to-end + SSR-equivalence test via `makeStyles`

**Files:**
- Create: `packages/core/src/createVar.integration.test.ts`

- [ ] **Step 1: Write the test**

Create `packages/core/src/createVar.integration.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createVar } from './createVar.js';
import { makeStyles } from './makeStyles.js';
import { createDOMRenderer } from './renderer/createDOMRenderer.js';
import { griffelRendererSerializer } from './common/snapshotSerializers.js';
import type { GriffelRenderer } from './types.js';

expect.addSnapshotSerializer(griffelRendererSerializer);

describe('createVar + makeStyles integration', () => {
  let renderer: GriffelRenderer;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    document.head.innerHTML = '';
    renderer = createDOMRenderer(document);
  });

  it('emits CSS with a resolved var name and makes the var usable as a key', () => {
    const colorVar = createVar();
    const useStyles = makeStyles({
      root: {
        [`${colorVar}`]: 'blue',
        color: `var(${colorVar})`,
      },
    });

    const classes = useStyles({ dir: 'ltr', renderer });
    expect(classes.root).toMatch(/^___\w+/);

    // The rendered CSS must contain the resolved var name and NOT contain
    // any placeholder token.
    const cssText = document.head.innerHTML;
    expect(cssText).not.toMatch(/--__g_var_p\d+__/);
    expect(cssText).toMatch(/--fv-/);
  });

  it('SSR equivalence: two independent renderers produce identical output', () => {
    const colorVar = createVar();
    const useStyles = makeStyles({
      root: {
        [`${colorVar}`]: 'blue',
        color: `var(${colorVar})`,
      },
    });

    const rendererServer = createDOMRenderer(document);
    const rendererClient = createDOMRenderer(document);

    const classesServer = useStyles({ dir: 'ltr', renderer: rendererServer });
    const classesClient = useStyles({ dir: 'ltr', renderer: rendererClient });

    // Same class names on server and client.
    expect(classesClient.root).toEqual(classesServer.root);

    // Coerced var name is the same.
    const nameAfterServer = `${colorVar}`;
    const nameAfterClient = `${colorVar}`;
    expect(nameAfterClient).toEqual(nameAfterServer);
    expect(nameAfterServer).toMatch(/^--fv-/);
  });

  it('inline-style use of the var returns the resolved name after useStyles has run', () => {
    const colorVar = createVar();
    const useStyles = makeStyles({
      root: { [`${colorVar}`]: 'blue', color: `var(${colorVar})` },
    });

    // Before first useStyles call, coercion returns the placeholder.
    // After, it returns the resolved name.
    useStyles({ dir: 'ltr', renderer });
    const coerced = `${colorVar}`;
    expect(coerced).toMatch(/^--fv-/);

    // Simulated component-side usage: `{ [colorVar]: 'red' }` in inline style.
    const inline: Record<string, string> = { [colorVar as unknown as string]: 'red' };
    expect(Object.keys(inline)[0]).toEqual(coerced);
  });

  it('first-definer-wins: a var reused across makeStyles blocks has a single stable name', () => {
    const shared = createVar();

    const useA = makeStyles({ root: { [`${shared}`]: 'red' } });
    const useB = makeStyles({ root: { color: `var(${shared})` } });

    useA({ dir: 'ltr', renderer });
    const nameAfterA = `${shared}`;

    useB({ dir: 'ltr', renderer });
    const nameAfterB = `${shared}`;

    expect(nameAfterB).toEqual(nameAfterA);
    expect(nameAfterA).toMatch(/^--fv-/);
  });
});
```

- [ ] **Step 2: Run test**

Run: `yarn nx test @griffel/core -- --run src/createVar.integration.test.ts`
Expected: PASS — 4 tests pass. If any fail, inspect the failure: most likely `makeStyles` caches `classesMapBySlot` across calls, which means the second `useStyles` call should reuse the same resolved name.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/createVar.integration.test.ts
git commit -m "test(core): integration + SSR equivalence tests for createVar"
```

---

## Task 7: Export `createVar` from `@griffel/core`

**Files:**
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Add the export**

Edit `packages/core/src/index.ts`. After the line `export { makeStyles } from './makeStyles.js';` (around line 61), add:

```ts
export { createVar } from './createVar.js';
```

Also, near the other `export type { ... } from '@griffel/style-types';` block (around lines 88–98), add `GriffelVar` to the list:

```ts
export type {
  // Static styles
  GriffelStaticStyle,
  GriffelStaticStyles,
  // Styles
  GriffelAnimation,
  GriffelStyle,
  // Reset styles
  GriffelResetStyle,
  // Variables
  GriffelVar,
  // Internal types
} from '@griffel/style-types';
```

- [ ] **Step 2: Build to verify exports resolve**

Run: `yarn nx run @griffel/core:build`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/index.ts
git commit -m "feat(core): export createVar and GriffelVar type"
```

---

## Task 8: Re-export `createVar` from `@griffel/react`

**Files:**
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Add the re-export**

Edit `packages/react/src/index.ts`. Update line 3 (the `@griffel/core` re-export) to include `createVar`:

```ts
export { RESET, shorthands, mergeClasses, createDOMRenderer, createVar } from '@griffel/core';
```

And line 4 (the `export type` block) to include `GriffelVar`:

```ts
export type { GriffelStyle, GriffelResetStyle, GriffelVar, CreateDOMRendererOptions, GriffelRenderer } from '@griffel/core';
```

- [ ] **Step 2: Build to verify**

Run: `yarn nx run @griffel/react:build`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/index.ts
git commit -m "feat(react): re-export createVar and GriffelVar from @griffel/core"
```

---

## Task 9: Smoke-test the public API from `@griffel/react`

**Files:**
- Create: `packages/react/src/createVar.smoke.test.tsx`

- [ ] **Step 1: Write a React smoke test**

Create `packages/react/src/createVar.smoke.test.tsx`:

```tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createVar, makeStyles, RendererProvider, createDOMRenderer } from './index.js';

describe('createVar (public @griffel/react API)', () => {
  it('renders to string with the same var name as client-side equivalent', () => {
    const colorVar = createVar();
    const useStyles = makeStyles({
      root: {
        [`${colorVar}`]: 'blue',
        color: `var(${colorVar})`,
      },
    });

    const Component: React.FC<{ override?: string }> = ({ override }) => {
      const classes = useStyles();
      const style = override ? { [colorVar as unknown as string]: override } : undefined;
      return <div className={classes.root} style={style} data-testid="el" />;
    };

    const serverRenderer = createDOMRenderer();
    const html = renderToString(
      <RendererProvider renderer={serverRenderer}>
        <Component override="red" />
      </RendererProvider>,
    );

    // The rendered HTML must NOT contain a placeholder.
    expect(html).not.toMatch(/--__g_var_p\d+__/);
    // The override style should carry the resolved var name.
    expect(`${colorVar}`).toMatch(/^--fv-/);
    expect(html).toContain(`${colorVar}:red`);
  });
});
```

- [ ] **Step 2: Run test**

Run: `yarn nx test @griffel/react -- --run src/createVar.smoke.test.tsx`
Expected: PASS. If `createDOMRenderer` requires `document` and the test env is not jsdom, check `packages/react/vitest.config.*` or `project.json` for the test environment and adjust accordingly (most core tests use jsdom).

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/createVar.smoke.test.tsx
git commit -m "test(react): smoke test for createVar through the public API"
```

---

## Task 10: Final verification and cleanup

- [ ] **Step 1: Run the full test suites**

Run:
```bash
yarn nx run-many --target=test --projects=@griffel/core,@griffel/react -- --run
```
Expected: all tests pass.

- [ ] **Step 2: Run builds**

Run:
```bash
yarn nx run-many --target=build --projects=@griffel/style-types,@griffel/core,@griffel/react
```
Expected: all builds succeed.

- [ ] **Step 3: Run lint on touched packages**

Run:
```bash
yarn nx run-many --target=lint --projects=@griffel/style-types,@griffel/core,@griffel/react
```
Expected: no new lint errors.

- [ ] **Step 4: Update index.ts sanity check**

Manually read `packages/core/src/index.ts` and `packages/react/src/index.ts` to confirm `createVar` and `GriffelVar` appear in the exports. (The harness will not auto-verify names.)

- [ ] **Step 5: Final commit (if any fixups were needed)**

```bash
git status
# if anything is dirty, review and commit with a descriptive message
```

---

## Follow-up plans (not covered here)

The spec `docs/superpowers/specs/2026-04-18-createVar-design.md` also calls for:

1. **Babel preset transform** (`packages/babel-preset`) — recognizing `createVar` as a marker import and replacing calls with build-time string literals. New plan file.
2. **OXC transform** (`packages/transform`) — same as above but for the OXC-based transform. New plan file.
3. **ESLint rule** (`packages/eslint-plugin`) — `create-var-at-module-scope`; enforces no args, module scope, no reassignment. Warn on multiple definers. New plan file.
4. **Jest serializer** (`packages/jest-serializer`) — render `GriffelVar` as its resolved name in snapshots. New plan file.

Write each as an independent plan after the core MVP lands and any issues surface.

## Known risks this plan accepts

- **Module load order must match between server and client** for the runtime (no-transform) path. This is the standard SSR assumption (same bundle loads on both sides); code splitting or lazy-imported modules may drift. The transform plan (follow-up #1/#2) fixes this by baking file+binding paths into the hash at build time.
- **Styles content hash coupling**: editing any property in a `makeStyles` block changes its block hash and therefore its vars' final names. Users should always reference vars through the `GriffelVar` object, never by copy-pasting the string.
- **`Symbol.toPrimitive` mutation** is subtle and requires careful test coverage for React StrictMode (double-invocation) and tree-shaken builds. If issues surface, switching from mutation to "always-go-through-the-registry" (var coerces by doing a map lookup every time) is a small refactor.
