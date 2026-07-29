# `createVar()` — SSR-safe unique CSS custom properties for Griffel

## Problem

Authoring CSS custom properties in `makeStyles` today relies on hand-authored names (`'--my-color'`), which collide between components and between nested instances of the same component. Requested originally in [fluentui#17923](https://github.com/microsoft/fluentui/issues/17923), never shipped.

Requirements:
1. Unique CSS variable names, even for nested instances of the same component.
2. **SSR-safe at runtime** — must work without the build-time transform. Griffel's runtime already works without the transform; `createVar` must match.
3. Compile-time safe — the transform, when present, produces stable ids and catches misuse.
4. Usable as both an object key in `makeStyles` and in component inline styles.

## API

```ts
// @griffel/core (re-exported from @griffel/react)
export function createVar(): GriffelVar;
```

`GriffelVar` is a branded, string-coercible reference. `Symbol.toPrimitive` returns the CSS custom-property name (`--fv-…`), so it works as an object key (`[v]`) and inside template strings (`` `var(${v})` ``). The TypeScript brand prevents accidental misuse (e.g. passing a plain string where a var is expected).

### Usage

```ts
import { createVar, makeStyles } from '@griffel/react';

const colorVar = createVar();

const useStyles = makeStyles({
  root: {
    [colorVar]: 'blue',              // DEFINITION: emits `--fv-…: blue` in the class
    color: `var(${colorVar})`,        // READ
  },
});

function Flex({ color }: { color: string }) {
  const styles = useStyles();
  return <div className={styles.root} style={{ [colorVar]: color }} />;
}
```

### Constraints (enforced by tooling)

- `createVar()` must be called at **module (program) scope**, bound to a `const`. ESLint rule + transform-time check.
- No arguments. Keeps the API minimal; named variants were considered and rejected (footguns around collision and mixed mental models).

## Runtime mechanics (SSR-safe, no transform required)

The key insight: the runtime already content-hashes style objects to produce deterministic class names (`packages/core/src/runtime/utils/hashClassName.ts`). `createVar` piggybacks on that same mechanism so final var names inherit its SSR guarantees. The counter used internally is a *placeholder* that is rewritten before anything reaches the DOM or CSSOM.

### Protocol

1. `createVar()` returns an object with a `Symbol.toPrimitive` method. Initial coercion returns an opaque placeholder `'--__g_var_p<n>__'`, where `<n>` is a module-scope counter. The placeholder is **internal**; it must never reach the DOM or CSS text.

2. When `resolveStyleRulesForSlots` walks the styles object passed to `makeStyles`, it detects placeholder strings in keys and values. For each unique placeholder within the block, it computes the block's existing content hash and emits `--fv-<contentHash>-<index>` where `<index>` is the deterministic ordinal of the var within the block.

3. The var's `Symbol.toPrimitive` is mutated (closure swap) to return the resolved name. Subsequent coercion in component inline styles yields the stable name.

4. **SSR correctness** follows from content-hashing: server and client independently derive the same name from the same styles object. No counter reaches output.

### Design decisions

- **Eager resolution at `makeStyles` call time**, not deferred to first `useStyles()` invocation. This avoids a render-time mutation step and means the var is fully resolved by the time any component code runs. `makeStyles` is called at module scope in Griffel; the added walk cost is paid once per block.
- **First-definer-wins for cross-block sharing**. A var can be used as a key in more than one `makeStyles` block; the first block whose `resolveStyleRulesForSlots` processes it owns the final name. Under normal React SSR this is deterministic (same component tree → same module-eval order → same first-definer). ESLint emits a *warning* (not error) for multiple definers, so teams can opt out if they want strictness.
- **Placeholder-leak policy**: runtime always throws when a `--__g_var_p…__` string is observed during CSS rule emission or React's inline-style reconciliation. Consistent between dev and prod — there is no case where a leaked placeholder produces useful output.

### Error cases

| Case | Detection | Action |
|---|---|---|
| `createVar()` inside function body | ESLint; transform when applied | ESLint error; fatal transform error |
| Var used only in inline style, never in any `makeStyles` key | ESLint (no definer found); runtime | ESLint error; runtime throw on render |
| `createVar()` with arguments | ESLint; TypeScript; transform | All three reject |
| Binding reassigned | ESLint; transform | All reject |
| Same var keyed in multiple `makeStyles` blocks | ESLint | Warning (opt-in strict mode errors) |

## Compile-time transform

Both `packages/babel-preset` (Babel) and `packages/transform` (OXC) learn a new recognized import name `createVar` alongside `makeStyles` / `makeResetStyles` / `makeStaticStyles` in the existing `modules` config.

During evaluation (Babel confident eval or Linaria VM fallback), `createVar()` calls resolve to a build-time constant:

```
--fv-<hash(filePath + bindingName + classNameHashSalt)>
```

The compiled output replaces `const colorVar = createVar()` with `const colorVar = '--fv-abc123'` — a plain string constant. Because the compiled var is a plain string, the placeholder/mutation protocol in §runtime is bypassed entirely when the transform is applied: `makeStyles`' style object already contains the final var name. Behavior is identical to the runtime path; the transform is a pure optimization.

### Transform-time validations (fatal, matches existing eval-failure-throws convention)

- `createVar()` must be a program-scope `const` declaration.
- No arguments.
- Binding must not be reassigned.

## Packaging and scope

**In scope:**
- `packages/core`: `createVar` function, placeholder protocol, resolve-time rewrite logic.
- `packages/style-types`: `GriffelVar` branded type.
- `packages/react`: re-export `createVar`.
- `packages/babel-preset` + `packages/transform`: recognize and rewrite `createVar` imports.
- `packages/eslint-plugin`: new rule `create-var-at-module-scope`, added to recommended config.
- `packages/jest-serializer`: render `GriffelVar` in snapshots as the resolved name, not the placeholder.

**Explicitly out of scope:**
- No `createTheme` / scoped-theme / multi-value-var helpers.
- No `var()` auto-wrapping (writers still write `` `var(${v})` ``).
- No runtime-settable defaults beyond what `[v]: 'blue'` already provides.

## Open risks

- **Content-hash coupling**: editing an unrelated property in a `makeStyles` block changes the block's hash and therefore the var's final name. This is consistent with how Griffel class names already behave, but worth noting in docs since var names may appear in user-authored CSS elsewhere (mitigate by ensuring vars are only consumed through the `GriffelVar` reference, never copy-pasted as literal strings).
- **Symbol.toPrimitive mutation**: the closure-swap trick is subtle. Tests must cover: multiple renders, SSR → hydrate, dev-mode StrictMode double-invocation, and tree-shaken builds where only one `makeStyles` of two survives.
- **Cross-block ordering under React 18 streaming / Suspense**: first-definer-wins is deterministic under classic SSR, but streaming rendering could theoretically interleave `makeStyles` resolution order differently between server and client. Needs a test case. If it's a real problem, fallback is to forbid multi-definer (make the ESLint warning a hard error).

## Testing

- Unit tests for `createVar` in `packages/core` covering the protocol, resolution, and error cases above.
- Integration test: render a component using `createVar` on the server and on the client; assert matching DOM output.
- Transform tests in `packages/babel-preset` and `packages/transform` covering valid uses, misuse errors, and the three validation rules.
- ESLint rule tests in `packages/eslint-plugin`.
