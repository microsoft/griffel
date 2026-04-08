# Change Log - @griffel/transform

This log was last generated on Wed, 08 Apr 2026 09:35:41 GMT and should not be manually modified.

<!-- Start content -->

## 3.0.1

Wed, 08 Apr 2026 09:35:41 GMT

### Patches

- fix: parse ESM files as modules in convertESMtoCJS (olfedias@microsoft.com)
- refactor(build): switch to @nx/js:tsc executor (olfedias@microsoft.com)
- Bump @griffel/transform-shaker to v1.0.3

## 3.0.0

Mon, 23 Mar 2026 16:50:27 GMT

### Major changes

- BREAKING: rename modules to importsToTransform, add functionsToTransform option (olfedias@microsoft.com)

### Patches

- fix: reverse styleCalls iteration to match CSS rule ordering of old plugin (olfedias@microsoft.com)
- fix: add zIndex fallback values in fluentTokensPlugin (olfedias@microsoft.com)

## 2.0.2

Fri, 13 Mar 2026 17:00:44 GMT

### Patches

- fix: wrap VM errors as host Error with filename context (olfedias@microsoft.com)
- perf: skip eval cache for __mkPreval entry-point evaluations (olfedias@microsoft.com)
- fix: wrap VM errors as host Error with filename context, defer CJS export assignments for IIFE patterns (olfedias@microsoft.com)
- Bump @griffel/transform-shaker to v1.0.2

## 2.0.0

Wed, 11 Mar 2026 13:33:34 GMT

### Major changes

- BREAKING: Replace @linaria/shaker with @griffel/transform-shaker. Remove babelOptions from TransformOptions. Remove StrictOptions type. (olfedias@microsoft.com)

### Patches

- feat: add collectPerfIssues option to TransformOptions (olfedias@microsoft.com)
- fix: fix VM result index mapping in batchEvaluator (olfedias@microsoft.com)

## 1.2.1

Fri, 06 Mar 2026 15:56:28 GMT

### Patches

- refactor: remove cookModuleId from module evaluation (olfedias@microsoft.com)
- Bump @griffel/core to v1.20.1

## 1.2.0

Fri, 06 Mar 2026 08:17:05 GMT

### Minor changes

- feat: add AST evaluator plugin system with evaluationPlugins option (olfedias@microsoft.com)
- feat: wrap imported asset paths in <griffel-asset> tags for reliable CSS extraction (olfedias@microsoft.com)
- feat: add makeStaticStyles AOT/CSS extraction support (olfedias@microsoft.com)
- feat: hybrid evaluator that shakes ESM node_modules instead of ignoring them (olfedias@microsoft.com)
- feat: throw on non-ESM input in transformSync (olfedias@microsoft.com)
- Bump @griffel/core to v1.20.0

### Patches

- refactor: use ScopeTracker from oxc-walker for scope-aware import resolution (olfedias@microsoft.com)
- refactor: extract dedupeCSSRules result to a variable in transformSync (olfedias@microsoft.com)
- refactor: internalize Linaria Module/EvalCache to remove @linaria/babel-preset dependency (olfedias@microsoft.com)
- perf: replace DeoptError with DEOPT sentinel symbol, optimize CSS rule dedup and lookups (olfedias@microsoft.com)

## 1.1.0

Mon, 03 Nov 2025 15:43:56 GMT

### Minor changes

- Add initial @griffel/transform package boilerplate (copilot@github.com)
- feat: add functionality (copilot@github.com)
