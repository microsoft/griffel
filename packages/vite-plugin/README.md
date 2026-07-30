# Vite plugin to perform CSS extraction in Griffel

A plugin for Vite that performs CSS extraction for [`@griffel/react`](../react).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Usage](#usage)
- [Options](#options)
- [How it works](#how-it-works)
  - [Development mode](#development-mode)
- [Caveats](#caveats)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
yarn add --dev @griffel/vite-plugin
# or
npm install --save-dev @griffel/vite-plugin
```

> ⚠️ The plugin requires Vite 8 or above and `@griffel/react` 1.7.7 or above.

## Usage

Within your Vite configuration, add the plugin:

```js
import { defineConfig } from 'vite';
import { griffel } from '@griffel/vite-plugin';

export default defineConfig({
  plugins: [griffel()],
});
```

The plugin automatically:

- Transforms `makeStyles()`, `makeResetStyles()`, and `makeStaticStyles()` calls at build time
- Extracts CSS from these calls into stylesheets handled by Vite
- Sorts CSS rules by specificity buckets, media queries, and container queries

No extra configuration is required: CSS is handled by Vite itself, so `<link>` tags in production work as usual. In
development the plugin does nothing and Griffel handles styles in runtime.

## Options

```js
griffel({
  // Files to process (default: /\.[cm]?[jt]sx?$/)
  include: /\.[cm]?[jt]sx?$/,
  // Files to skip, nothing is excluded by default as dependencies may also use Griffel
  exclude: undefined,

  // Compare function for sorting media queries (default: @griffel/core's defaultCompareMediaQueries)
  compareMediaQueries: myCompareFunction,

  // Compare function for sorting container queries (default: same comparator as compareMediaQueries)
  compareContainerQueries: myCompareFunction,

  // Override the resolver used to resolve imports inside evaluated modules
  resolverFactory: myResolverFactory,

  // A salt that is added to generated class names
  classNameHashSalt: '',

  // Modules that export Griffel functions (default: ["@griffel/core", "@griffel/react", "@fluentui/react-components"])
  importsToTransform: ['@griffel/react'],

  // Functions that should be treated as Griffel style calls
  functionsToTransform: ['makeStyles', 'makeResetStyles', 'makeStaticStyles'],

  // Rules that define how matched files are transformed during the evaluation
  evaluationRules: undefined,

  // Collect and log timing stats once a build is finished
  collectStats: false,

  // Collect and log dependencies that slow down evaluation (CJS modules, "export *" barrels)
  collectPerfIssues: false,
});
```

## How it works

The plugin is a pair of Vite plugins:

- `griffel:transform` runs before other transforms (`enforce: 'pre'`) and replaces Griffel calls with their evaluated
  results. The extracted CSS is served from a virtual CSS module that is imported by a transformed file.
- `griffel:extract` runs after the CSS assets are produced (`enforce: 'post'`) and merges the CSS of all chunks into
  the assets of entrypoints, sorting & deduplicating rules on the way.

Both apply to production builds only.

Griffel relies on the order of CSS rules: rules are grouped in style buckets and can be overridden only by rules from
the same or a later bucket. As Vite emits a stylesheet per chunk, the rules of a lazy loaded chunk would be applied
after the rules of an application. The plugin avoids it by moving all Griffel rules into a single stylesheet, this
matches the behavior of the dedicated `griffel` chunk in `@griffel/webpack-plugin`.

### Development mode

The plugin applies to production builds only (`apply: 'build'`). A dev server has no bundling step, so there is no
stylesheet to extract rules into, and Griffel handles styles in runtime there as it does without the plugin.

## Caveats

- Files that are not ES modules are skipped, Griffel calls in them will be handled by the runtime.
- If a project has multiple entrypoints, each of them gets a copy of all extracted Griffel CSS.
