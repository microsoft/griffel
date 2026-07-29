# @griffel/e2e-vite

End-to-end test that ensures AOT compilation & CSS extraction remain compatible with Vite.

The suite packs the local Griffel packages into a temporary project, installs Vite, runs a real
build of the app in [`src/fixture`](./src/fixture) and compares the emitted CSS against
[`src/snapshot.css`](./src/snapshot.css).

It also asserts that **exactly one** stylesheet is emitted: Griffel rules may only be overridden by
rules from the same or a later style bucket, so they must not be spread over stylesheets that load
in an arbitrary order.

Unlike the Webpack & Rspack suites, `@griffel/react` is **not** externalized. The plugin excludes
nothing by default, so its sources are transformed as part of the build — which is what keeps the
`griffel-css-extraction-disable` marker they carry covered.

Run it with:

```sh
yarn nx run @griffel/e2e-vite:test
```

Update the CSS snapshot after an intentional change with:

```sh
yarn nx run @griffel/e2e-vite:test --update
```

> [!NOTE]
> Snapshots are formatted with Prettier, and class names for rules containing `url()` are redacted:
> `@griffel/transform` hashes the resolved absolute asset path, which differs per machine.
