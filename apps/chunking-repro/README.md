# Griffel chunking repro

A minimal app that demonstrates why `@griffel/webpack-plugin` currently
forces all extracted CSS into a single `griffel.css` chunk and what
breaks if it doesn't.

## Layout

- `src/page-a.tsx`, `src/page-b.tsx` — two webpack entry points.
- `src/styles/shared.ts` — atomic styles imported by both pages
  (lives in a shared chunk under default `SplitChunksPlugin`).
- `src/styles/page-a.ts`, `src/styles/page-b.ts` — per-page atomic styles
  using buckets `d` (default), `h` (hover), and `m` (`@media`).
  Page B also uses a shorthand (`gap`) + a longhand override (`rowGap`)
  to exercise priority ordering.

## Build

```sh
# Default mode: GriffelPlugin's single-chunk forcing is on (current behavior).
node build.mjs

# Split mode: a tiny "DisableGriffelChunkMergePlugin" runs after GriffelPlugin
# and removes the forced 'griffel' SplitChunks cache group, letting webpack
# place each .griffel.css module in whichever chunk discovers it first.
node build.mjs --split
```

Outputs land under `dist/apps/chunking-repro/{default,split}/`.

## What you see

### Default mode (`dist/apps/chunking-repro/default/griffel.css`)

One file, rules sorted globally by `(media, bucket, priority)`:

```css
.f1t5xh8k{border:1px solid black;}            /* d, p=-2 (shorthand)  */
.f19gb1f4{gap:8px;}                            /* d, p=-1 (shorthand)  */
.f1sy4kr4{padding:12px;}                       /* d, p=-1 (shorthand)  */
.fe3e8s9{color:red;}                           /* d, p=0  (longhand)   */
.fka9v86{color:green;}
.ftuwxu6{display:inline-flex;}
.f7qsgvn{row-gap:24px;}                        /* d, p=0 - wins over gap */
.ftgm304{display:block;}
.f10q6zxg:hover{color:blue;}                   /* h                    */
@media (min-width: 800px){.f92grqi{color:orange;}}  /* m                */
```

LVHA + at-rule order is preserved; `rowGap` reliably overrides `gap`.

### Split mode (`dist/apps/chunking-repro/split/`)

Three files: `226.css` (shared), `page-a.css`, `page-b.css`.
Each file preserves its own block-level structure but no cross-file
sort runs (the plugin sorts only the named `griffel` chunk that no
longer exists). Concretely, `226.css` ships `display:block`
*before* `padding:12px` *before* `border:1px solid black` — i.e.
**inverse of the priority order**. And page-b's `gap` (priority -1)
ships earlier in the same file as `rowGap` (priority 0), which works
in this contrived case but only because they happen to land in the
same module.

The actual cascade now depends on browser `<link>` evaluation order:

- If `226.css` loads AFTER `page-a.css`, page-a's `color:red` (bucket
  `d`) appears in the cascade BEFORE 226's later rules — fine here, but
  in any other authoring `:hover` (bucket `h`) emitted in `page-a.css`
  could be defeated by a later same-property base rule from `226.css`.
- The same applies across `@media` and shorthand priorities: a
  cross-chunk longhand cannot count on appearing after its shorthand.
- Hover and `@media` rules duplicate across `page-a.css` and
  `page-b.css` (same class hashes), inflating CSS for free.

This is what motivates moving away from the single-chunk constraint
without giving up cascade correctness.

## Serve it locally

```sh
node build.mjs && node serve.mjs           # default mode
node build.mjs --split && node serve.mjs --split   # broken mode
```

Then open `http://localhost:3000/page-a.html` and
`http://localhost:3000/page-b.html`.
