# Vite & Vitest Setup for Nx Workspace

This workspace now supports Vite and Vitest as an alternative to the existing Jest-based testing framework.

## Setup Overview

### Dependencies Added
- `@nx/vite@21.5.3` - Nx plugin for Vite integration
- `vitest@3.2.4` - Fast test runner powered by Vite
- `@vitest/ui@3.2.4` - UI for Vitest
- `jsdom@27.0.0` - DOM environment for browser-based tests

### Configuration Files
- `vitest.config.ts` - Workspace-level Vitest configuration
- `vitest.setup.ts` - Global test setup with Jest compatibility shims
- Updated `nx.json` with `@nx/vite` target defaults

### Available Scripts
- `yarn test:vitest` - Run tests in watch mode
- `yarn test:vitest:ui` - Run tests with UI interface
- `yarn test:vitest:run` - Run tests once and exit

## Usage

### Workspace-level Testing
Run all tests using Vitest:
```bash
yarn test:vitest:run
```

### Package-level Testing
Each package can have its own `vitest.config.ts` for specific configuration. See `packages/vite-plugin/vitest.config.ts` for an example.

To add Vitest support to a package:

1. Create `vitest.config.ts` in the package root
2. Add a `test:vitest` target to the package's `project.json`:
   ```json
   "test:vitest": {
     "executor": "@nx/vite:test",
     "dependsOn": ["^build"],
     "options": {
       "configFile": "packages/your-package/vitest.config.ts"
     }
   }
   ```

### Test File Patterns
Vitest looks for test files matching these patterns:
- `**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`

### Jest Compatibility
The setup includes Jest compatibility shims in `vitest.setup.ts` for:
- `jest.fn()` → `vi.fn()`
- `jest.spyOn()` → `vi.spyOn()`
- `jest.mock()` → `vi.mock()`
- And other Jest globals

## Benefits of Vitest
- Faster test execution with Vite's lightning-fast HMR
- Native ES modules support
- TypeScript support out of the box
- Jest-compatible API for easy migration
- Better integration with modern tooling

## Current Status
This is the foundational setup. Individual packages can opt into Vitest testing while maintaining compatibility with the existing Jest setup.