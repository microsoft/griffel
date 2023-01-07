---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# With Babel

## Install

<Tabs>
<TabItem value="yarn" label="Yarn">

```shell
yarn add --dev @griffel/babel-preset @griffel/linaria-processor
```

</TabItem>
<TabItem value="npm" label="NPM">

```shell
npm install --save-dev @griffel/babel-preset @griffel/linaria-processor
```

</TabItem>
</Tabs>

## Usage

Modify `.babelrc` to include:

```json
{
  "presets": ["@griffel"]
}
```

## Configuration

Please check [the README](https://github.com/microsoft/griffel/tree/main/packages/babel-preset) of `@griffel/babel-preset` to check how to configure module evaluation and imports.
