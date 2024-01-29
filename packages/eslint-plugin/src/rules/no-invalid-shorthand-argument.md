# All shorthands must not use space separators, and instead pass in multiple arguments (`@griffel/no-invalid-shorthand-argument`)

Griffel provides [shorthand functions](https://griffel.js.org/react/api/shorthands) that map parameters onto longhand CSS properties.
These functions don't parse or separate the parameters, so they can't be used with one long string.
Parameters must be passed as separate string arguments.

## Rule Details

Examples of **incorrect** code for this rule:

```js
import { shorthands } from '@griffel/react';

// ❌ Will produce wrong results
shorthands.padding('2px 4px');
```

Examples of **correct** code for this rule:

```js
import { shorthands } from '@griffel/react';

// ✅ Correct output
shorthands.padding('2px', '4px');
```
