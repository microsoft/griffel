# Change Log - @griffel/webpack-extraction-plugin

This log was last generated on Wed, 01 Feb 2023 10:47:40 GMT and should not be manually modified.

<!-- Start content -->

## 0.3.5

Wed, 01 Feb 2023 10:47:40 GMT

### Patches

- fix: avoid conflicts with SplitChunksPlugin (olfedias@microsoft.com)

## 0.3.4

Thu, 26 Jan 2023 14:06:28 GMT

### Patches

- feat: implement "unstable_keepOriginalCode" for extraction plugin (olfedias@microsoft.com)
- fix: properly handle @media in __resetStyles() (olfedias@microsoft.com)
- fix: support aliased imports (olfedias@microsoft.com)
- Bump @griffel/core to v1.9.1

## 0.3.3

Tue, 20 Dec 2022 11:48:33 GMT

### Patches

- Bump @griffel/core to v1.9.0

## 0.3.2

Fri, 09 Dec 2022 11:15:19 GMT

### Patches

- fix: avoid empty CSS imports (olfedias@microsoft.com)
- chore: remove loader-utils & schema-utils from dependencies (olfedias@microsoft.com)
- chore: remove path magic in extraction process (olfedias@microsoft.com)
- Bump @griffel/core to v1.8.3

## 0.3.1

Wed, 30 Nov 2022 17:14:53 GMT

### Patches

- chore: update loader-utils dependency (olfedias@microsoft.com)
- fix: don't throw in the plugin (olfedias@microsoft.com)

## 0.3.0

Wed, 30 Nov 2022 09:32:24 GMT

### Minor changes

- chore: rework plugin to avoid dependency on splitChunks.cacheGroups (olfedias@microsoft.com)

## 0.2.2

Thu, 24 Nov 2022 10:05:12 GMT

### Patches

- fix: use style buckets in CSS extraction (olfedias@microsoft.com)
- Bump @griffel/core to v1.8.2

## 0.2.1

Wed, 26 Oct 2022 11:06:03 GMT

### Patches

- Bump @griffel/core to v1.8.1

## 0.2.0

Thu, 13 Oct 2022 08:36:18 GMT

### Minor changes

- feat: add support for makeResetStyles (olfedias@microsoft.com)
- Bump @griffel/core to v1.8.0

### Patches

- fix: handle multiple url() (olfedias@microsoft.com)

## 0.1.8

Wed, 05 Oct 2022 14:28:43 GMT

### Patches

- Bump @griffel/core to v1.7.0

## 0.1.7

Tue, 04 Oct 2022 08:44:33 GMT

### Patches

- chore: adopt API changes from @griffel/core (olfedias@microsoft.com)
- Bump @griffel/core to v1.6.1

## 0.1.6

Tue, 16 Aug 2022 11:16:00 GMT

### Patches

- Bump @griffel/core to v1.6.0

## 0.1.5

Fri, 05 Aug 2022 09:44:44 GMT

### Patches

- feat: add NextJS plugin for CSS extraction (dwlad90@gmail.com)

## 0.1.4

Wed, 03 Aug 2022 13:28:05 GMT

### Patches

- fix: assets handling in Windows env (olfedias@microsoft.com)

## 0.1.3

Wed, 27 Jul 2022 13:03:12 GMT

### Patches

- fix: handle asset imports (olfedias@microsoft.com)
- Bump @griffel/core to v1.5.1

## 0.1.2

Tue, 19 Jul 2022 10:20:09 GMT

### Patches

- fix: handle comments in output (olfedias@microsoft.com)
- Bump @griffel/core to v1.5.0

## 0.1.1

Tue, 28 Jun 2022 15:47:33 GMT

### Patches

- fix: improve getElementReference() to handle multiple childen (olfedias@microsoft.com)

## 0.1.0

Tue, 28 Jun 2022 09:50:50 GMT

### Minor changes

- chore: initial release (olfedias@microsoft.com)
- Bump @griffel/core to v1.4.1

## 0.0.1

Thu, 23 Jun 2022 08:37:05 GMT

### Patches

- Bump @griffel/core to v1.4.0
