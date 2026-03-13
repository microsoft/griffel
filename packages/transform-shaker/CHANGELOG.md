# Change Log - @griffel/transform-shaker

This log was last generated on Fri, 13 Mar 2026 17:00:44 GMT and should not be manually modified.

<!-- Start content -->

## 1.0.2

Fri, 13 Mar 2026 17:00:44 GMT

### Patches

- fix: protect structural children from removal, handle export * as ns correctly (olfedias@microsoft.com)
- fix: guard control flow structural children (catch param, labels, loop tests) from removal (olfedias@microsoft.com)
- chore: initial release (olfedias@microsoft.com)
- perf: use specific oxc types instead of Node intersections (olfedias@microsoft.com)
