# @griffel/transform

A high-performance transformation package for Griffel that unifies CSS-in-JS transformation and extraction functionality.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
  - [Basic Transformation](#basic-transformation)
- [API Reference](#api-reference)
  - [transformSync(sourceCode, options)](#transformsyncsourcecode-options)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

`@griffel/transform` provides a unified approach to CSS-in-JS transformation and extraction for Griffel. It replaces Babel-based processing with modern OXC-based parsing for improved performance while maintaining full compatibility with existing Griffel APIs.

## Features

- **🚀 High Performance**: Uses OXC parser instead of Babel for ~10x faster AST processing
- **🔄 Unified Transformation**: Combines style transformation and CSS extraction in one pass
- **⚡ Smart Evaluation**: AST-based evaluation for simple expressions, VM fallback for complex cases
- **📦 Asset Processing**: Automatic inlining of imported assets in CSS rules
- **🎯 Tree Shaking**: Only processes files that actually contain Griffel usage
- **🔧 Build Tool Ready**: Designed for integration with webpack, Vite, and other build tools

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
