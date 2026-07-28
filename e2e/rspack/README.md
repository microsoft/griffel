# @griffel/e2e-rspack

End-to-end test that ensures AOT compilation & CSS extraction remain compatible with Rspack.

Each scenario packs the local Griffel packages into a temporary project, installs Rspack, runs a
real build and compares the emitted CSS against a snapshot in [`src/snapshots`](./src/snapshots):

| Scenario                      | Rspack    | Griffel packages under test                            |
| ----------------------------- | --------- | ------------------------------------------------------ |
| `legacy-rspack-1`             | 1.7.11    | `webpack-loader` + `webpack-extraction-plugin` (Babel) |
| `legacy-css-extract-rspack-1` | 1.7.11    | same, with `css-loader` in the chain                   |
| `legacy-rspack-2`             | workspace | same, on the workspace version of Rspack               |
| `modern-rspack-2`             | workspace | `webpack-plugin` (`@griffel/transform`)                |

Run it with:

```sh
yarn nx run @griffel/e2e-rspack:test
```

The suite runs on Vitest, so the usual flags apply — run a single scenario with `-t`, and update the
CSS snapshots after an intentional change with `-u`:

```sh
yarn vitest run --project @griffel/e2e-rspack -t modern-rspack-2
yarn vitest run --project @griffel/e2e-rspack -u
```

> [!NOTE]
> Snapshots are formatted with Prettier, and class names for rules containing `url()` are redacted:
> `@griffel/transform` hashes the resolved absolute asset path, which differs per machine.
