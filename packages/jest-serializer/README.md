# Jest serializer for Griffel

Provides a Jest serializer for `@griffel/react` which removes class names.

## Install

Add it as a dependency:

```bash
yarn add --dev @griffel/jest-serializer
# or
npm install --save-dev @griffel/jest-serializer
```

Update your `jest.config.js` (or appropriate config location) to include a `snapshotSerializers` array that references this package:

```js
module.exports = {
  snapshotSerializers: ['@griffel/jest-serializer'],
};
```

## Overview

When using Jest snapshot testing with components that use `@griffel/react`, classes will be
rendered as such:

```html
<div class="static-class __1qdh4ig f16th3vw frdkuqy0 fat0sn40 fjseox00">Hello world</div>
```

Using this serializer, the generated class names will be stripped:

```html
<div class="static-class">Hello world</div>
```

This means that your tests can pass reliably (no generated class names) and your rules get included in the snapshot.
I.e. snapshots doesn't need update when CSS is altered.)
