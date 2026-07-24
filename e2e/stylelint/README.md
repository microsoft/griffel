# @griffel/e2e-stylelint

End-to-end test that verifies [`@griffel/postcss-syntax`](../../packages/postcss-syntax) can be
wired into [stylelint](https://stylelint.io/) as a
[custom syntax](https://stylelint.io/developer-guide/syntaxes) to lint Griffel CSS-in-JS files.

The test packs the local `@griffel/postcss-syntax` and `@griffel/babel-preset` packages, installs
`stylelint` into a temporary project, and runs `stylelint` (configured with the Griffel custom
syntax) against `*.styles.ts` fixtures:

- **`green.styles.ts`** — a valid file, asserts stylelint reports no problems.
- **`error.styles.ts`** — a `makeStyles` call with an unmatchable `:nth-child(0)` selector, asserts
  stylelint reports the built-in `selector-anb-no-unmatchable` rule for the generated CSS.
- **`disabled.styles.ts`** — the same violation, but suppressed with a `griffel-csslint-disable`
  comment directive; asserts the directive emits a `stylelint-disable-line` and stylelint reports no
  problems.

Run it with:

```sh
yarn nx run @griffel/e2e-stylelint:test
```
