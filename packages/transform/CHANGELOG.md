# Change Log - @griffel/transform

This log was last generated on Fri, 06 Mar 2026 15:56:28 GMT and should not be manually modified.

<!-- Start content -->

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
