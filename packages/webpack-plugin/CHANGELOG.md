# Change Log - @griffel/webpack-plugin

This log was last generated on Fri, 06 Mar 2026 15:56:28 GMT and should not be manually modified.

<!-- Start content -->

## 2.0.0

Fri, 06 Mar 2026 15:56:28 GMT

### Major changes

- BREAKING: consolidate resolvers into ESM-first createResolverFactory, remove enhanced-resolve dependency (olfedias@microsoft.com)
- Bump @griffel/transform to v1.2.1
- Bump @griffel/core to v1.20.1

## 1.1.0

Fri, 06 Mar 2026 08:17:05 GMT

### Minor changes

- feat: initial release of @griffel/webpack-plugin (olfedias@microsoft.com)
- feat: add makeStaticStyles AOT/CSS extraction support (olfedias@microsoft.com)
- feat: add createFluentOxcResolverFactory for FluentUI ESM resolution (olfedias@microsoft.com)
- feat: create @griffel/webpack-plugin package with boilerplate (copilot@microsoft.com)
- Bump @griffel/transform to v1.2.0
- Bump @griffel/core to v1.20.0

### Patches

- chore: bump oxc-resolver to ^11.19.1 (olfedias@microsoft.com)
- perf: merge triple sort into single comparator, use Buffer.indexOf, cache JSON.stringify (olfedias@microsoft.com)
- fix: resolve tagged asset paths before CSS generation (olfedias@microsoft.com)
