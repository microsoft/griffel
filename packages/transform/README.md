# @griffel/transform

A high-performance transformation package for Griffel that unifies CSS-in-JS transformation and extraction functionality.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Install](#install)
- [Usage](#usage)
  - [Basic Transformation](#basic-transformation)
- [API Reference](#api-reference)
  - [transformSync(sourceCode, options)](#transformsyncsourcecode-options)
- [Evaluation Plugins](#evaluation-plugins)
  - [Built-in Plugins](#built-in-plugins)
    - [`fluentTokensPlugin`](#fluenttokensplugin)
  - [Custom Plugins](#custom-plugins)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

`@griffel/transform` provides a unified approach to CSS-in-JS transformation and extraction for Griffel. It replaces Babel-based processing with modern OXC-based parsing for improved performance while maintaining full compatibility with existing Griffel APIs.

## Install

```bash
yarn add --dev @griffel/transform
# or
npm install --save-dev @griffel/transform
```

## Usage

### Basic Transformation

```typescript
import { transformSync } from '@griffel/transform';

const sourceCode = `
  import { makeStyles } from '@griffel/react';
  
  const useStyles = makeStyles({
    root: { color: 'red' }
  });
`;

const result = transformSync(sourceCode, {
  filename: 'styles.ts',
});

console.log(result.code); // Transformed code with __css calls
console.log(result.cssRulesByBucket); // Extracted CSS rules
```

## API Reference

### transformSync(sourceCode, options)

Transforms source code containing `makeStyles` or `makeResetStyles` calls.

**Parameters:**

- `sourceCode` (string): Source code to transform
- `options` (TransformOptions): Transformation options

**Returns:** `TransformResult` object containing:

- `code`: Transformed source code
- `cssRulesByBucket`: Extracted CSS rules organized by bucket type
- `usedProcessing`: Whether any transformations were applied
- `usedVMForEvaluation`: Whether VM evaluation was used

**TransformOptions:**

- `filename` (string): File path for error reporting and source maps
- `classNameHashSalt?` (string): Salt for CSS class name generation
- `generateMetadata?` (boolean): Include metadata in CSS rules
- `modules?` (string[]): Module sources to process
- `babelOptions?` (object): Babel configuration for complex evaluations
- `evaluationRules?` (array): Rules for determining evaluation strategy
- `evaluationPlugins?` (AstEvaluatorPlugin[]): Plugins for extending AST evaluation with custom node handling

## Evaluation Plugins

The AST evaluator supports a plugin system that allows extending static evaluation to handle additional AST node types. Plugins are tried in order when the base evaluator encounters a node type it doesn't handle (i.e., anything beyond `Literal`, `ObjectExpression`, and simple `TemplateLiteral` without expressions).

### Built-in Plugins

#### `fluentTokensPlugin`

Handles Fluent UI design token expressions, transforming `tokens.propertyName` into `var(--propertyName)`:

```typescript
import { transformSync, fluentTokensPlugin } from '@griffel/transform';

const result = transformSync(sourceCode, {
  filename: 'styles.ts',
  evaluationPlugins: [fluentTokensPlugin],
});
```

This plugin handles:

- `MemberExpression`: `tokens.colorBrandBackground` → `var(--colorBrandBackground)`
- `TemplateLiteral`: `` `${tokens.spacingVerticalS} 0` `` → `var(--spacingVerticalS) 0`

### Custom Plugins

You can create custom plugins by implementing the `AstEvaluatorPlugin` interface:

```typescript
import { type AstEvaluatorPlugin, DeoptError } from '@griffel/transform';

const myPlugin: AstEvaluatorPlugin = {
  name: 'myPlugin',
  evaluateNode(node, context) {
    // Handle specific node types
    if (node.type === 'MemberExpression') {
      // Custom evaluation logic...
      return 'some-value';
    }

    // Throw DeoptError to signal "can't handle this node" and let the next plugin try
    throw new DeoptError('myPlugin: unsupported node');
  },
};

const result = transformSync(sourceCode, {
  filename: 'styles.ts',
  evaluationPlugins: [myPlugin],
});
```

The `context` parameter provides:

- `programAst`: The full program AST for cross-referencing
- `evaluateNode(node)`: Recursive evaluator callback that goes through base evaluation + all plugins
