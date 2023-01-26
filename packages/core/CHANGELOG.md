# Change Log - @griffel/core

This log was last generated on Thu, 26 Jan 2023 14:06:28 GMT and should not be manually modified.

<!-- Start content -->

## 1.9.1

Thu, 26 Jan 2023 14:06:28 GMT

### Patches

- chore: adjust console logging to emit a more descriptive error message (dzearing@microsoft.com)

## 1.9.0

Tue, 20 Dec 2022 11:48:33 GMT

### Minor changes

- feat: expose "styleElementAttributes" on GriffelRenderer (olfedias@microsoft.com)

### Patches

- fix: avoid mutations in getStyleSheetForBucket (olfedias@microsoft.com)
- fix: do not emit "undefined" for CSS rules (olfedias@microsoft.com)

## 1.8.3

Fri, 09 Dec 2022 11:15:19 GMT

### Patches

- fix: use global constants (olfedias@microsoft.com)

## 1.8.2

Thu, 24 Nov 2022 10:05:12 GMT

### Patches

- chore: export "CSSBucketEntry" type for internal usage (olfedias@microsoft.com)

## 1.8.1

Wed, 26 Oct 2022 11:06:03 GMT

### Patches

- feat: add validation into mergeClasses for makeResetStyles calls (olfedias@microsoft.com)

## 1.8.0

Thu, 13 Oct 2022 08:36:18 GMT

### Minor changes

- feat: add support for `animationName` in makeResetStyles (olfedias@microsoft.com)

### Patches

- chore: add __resetStyles (internal function) (olfedias@microsoft.com)
- chore: add __resetStyles (internal function) (olfedias@microsoft.com)

## 1.7.0

Wed, 05 Oct 2022 14:28:43 GMT

### Minor changes

- feat: add makeResetStyles to @griffel/core (olfedias@microsoft.com)

### Patches

- fix: handle empty strings in mergeClasses() (olfedias@microsoft.com)

## 1.6.1

Tue, 04 Oct 2022 08:44:33 GMT

### Patches

- fix: update debug data collection to handle duplicate overrides (yuanboxue@microsoft.com)
- fix: add TSDoc to unsupported CSS properties (tigeroakes@microsoft.com)
- fix: do not emit sequence hashes for empty sets (olfedias@microsoft.com)
- fix: handle nesting in comma separated selectors (olfedias@microsoft.com)
- chore: create stylis plugin to handle :global() (olfedias@microsoft.com)

## 1.6.0

Tue, 16 Aug 2022 11:16:00 GMT

### Minor changes

- feat: add transition shorthand (bernardo.sunderhus@gmail.com)

## 1.5.1

Wed, 27 Jul 2022 13:03:12 GMT

### Patches

- feat: Add support for source maps in devtools (yuanboxue@microsoft.com)
- fix: add css rules to devtools extension debugger when pass renderer on SSR (dwlad90@gmail.com)
- fix: flip CSS properties even if they contain CSS variables (miroslav.stastny@microsoft.com)

## 1.5.0

Tue, 19 Jul 2022 10:20:09 GMT

### Minor changes

- feat: add shorthand function for `grid-area` (geoff.cox@live.com)

## 1.4.1

Tue, 28 Jun 2022 09:50:50 GMT

### Patches

- chore: export getStyleBucketName & normalizeCSSBucketEntry functions for internal usage (olfedias@microsoft.com)

## 1.4.0

Thu, 23 Jun 2022 08:37:05 GMT

### Minor changes

- feat: create isomorphic stylesheet for DOM renderer (lingfangao@hotmail.com)
- feat: add `compareMediaQueries` option to DOM renderer (lingfangao@hotmail.com)
- feat: insert media queries into separate buckets based on the media query value (lingfangao@hotmail.com)
- feat: add shorthands support for flex property (riacarmin@microsoft.com)

### Patches

- chore: add __css() functions for upcoming CSS extraction (olfedias@microsoft.com)
- fix: collect devtools data in __styles (yuanboxue@microsoft.com)

## 1.3.1

Tue, 17 May 2022 08:34:48 GMT

### Patches

- fix: update isDevToolsEnabled check (olfedias@microsoft.com)

## 1.3.0

Wed, 04 May 2022 16:15:22 GMT

### Minor changes

- feat: inject devtools when session storage contains __GRIFFEL_DEVTOOLS__ (yuanboxue@microsoft.com)
- feat: add support for @layer (mgodbolt@microsoft.com)
- feat: add shorthand function for outline (bsunderhus@microsoft.com)
- feat: add shorthand function for inset (bsunderhus@microsoft.com)
- feat: generate debug hash sequence for devtools (yuanboxue@microsoft.com)

### Patches

- fix: fix issue with comma-separated selectors and RTL (seanmonahan@microsoft.com)

## 1.2.0

Wed, 06 Apr 2022 13:28:28 GMT

### Minor changes

- feat: CSS fallback values (miroslav.stastny@microsoft.com)
- feat: add "styleElementAttributes" to createDOMRenderer (olfedias@microsoft.com)

## 1.1.1

Wed, 09 Mar 2022 13:56:06 GMT

### Patches

- chore: add dependencies explicitly to package.json (olfedias@microsoft.com)

## 1.1.0

Mon, 07 Mar 2022 09:08:07 GMT

### Minor changes

- feat: do not add unsupported CSS properties to DOM (lingfangao@hotmail.com)

### Patches

- chore: add sourcemaps to dist files (olfedias@microsoft.com)
- fix: improve typings to solve TS issues (olfedias@microsoft.com)
- chore: update csstype to 3.0.10 (rahulsunil2@gmail.com)

## 1.0.7

Tue, 18 Jan 2022 10:20:48 GMT

### Patches

- fix false positive warning in mergeClasses() (olfedias@microsoft.com)

## 1.0.6

Mon, 17 Jan 2022 22:27:07 GMT

### Patches

- fixes to publish & build, added meta information to package.json (olfedias@microsoft.com)

## 1.0.5

Mon, 17 Jan 2022 18:56:09 GMT

### Patches

- fix: rename types to proper names (olfedias@microsoft.com)

## 1.0.4

Mon, 17 Jan 2022 18:34:20 GMT

### Patches

- fix broken publish (olfedias@microsoft.com)

## 1.0.3

Mon, 17 Jan 2022 17:45:09 GMT

### Patches

- fix broken publish (olfedias@microsoft.com)

## 1.0.2

Mon, 17 Jan 2022 17:20:58 GMT

### Patches

- fix bundle size issues caused by bundling (olfedias@microsoft.com)

## 1.0.1

Mon, 17 Jan 2022 16:01:30 GMT

### Patches

- initial release (olfedias@microsoft.com)
