# Griffel - CSS-in-JS with Ahead-of-time Compilation

Griffel is a CSS-in-JS library with near-zero runtime, SSR support, and ahead-of-time compilation. It's organized as a monorepo using Nx with 16+ packages and applications including React bindings, build-time transforms, DevTools, and benchmarking suite.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Setup
- Node.js version 20+ is required (`node --version` should show v20.x.x)
- Yarn 4.3.1 is the package manager (`yarn --version` should show 4.3.1)
- Uses Nx monorepo for task orchestration

### Bootstrap, Build, and Test
**CRITICAL: NEVER CANCEL long-running commands. Set timeouts appropriately.**

```bash
# Install dependencies - takes ~2 minutes
yarn install --immutable
# NEVER CANCEL: May take up to 3 minutes. Set timeout to 300+ seconds.

# Build all packages - takes ~1 minute 15 seconds  
yarn nx run-many --target=build --all
# NEVER CANCEL: Build takes 1-2 minutes. Set timeout to 180+ seconds.

# Run all tests - takes ~3 minutes
yarn nx run-many --target=test --all
# NEVER CANCEL: Tests take 3-4 minutes. Set timeout to 300+ seconds.

# Type check all projects - takes ~1 minute 30 seconds
yarn nx run-many --target=type-check --all
# NEVER CANCEL: Type checking takes 1-2 minutes. Set timeout to 180+ seconds.

# Lint all projects - takes ~17 seconds
yarn nx run-many --target=lint --all
# NEVER CANCEL: Linting takes 15-30 seconds. Set timeout to 60+ seconds.
```

### Development Servers
```bash
# Start documentation website (Docusaurus)
yarn start
# Serves on http://localhost:3000
# NEVER CANCEL: Initial build takes 30-60 seconds. Set timeout to 120+ seconds.

# Build benchmark app (if needed)
yarn nx run @griffel/benchmark:build
```

### Working with Affected Changes (Nx)
When using Nx affected commands in a repository that may not have a main branch locally:
```bash
# Use run-many instead of affected if git comparison fails
yarn nx run-many --target=build --all   # Instead of yarn build
yarn nx run-many --target=test --all    # Instead of yarn test
yarn nx run-many --target=lint --all    # Instead of yarn lint
```

## Validation

### Manual Testing Requirements
**ALWAYS test changes by running through complete scenarios:**

1. **Core Library Changes**: Test makeStyles functionality
   ```bash
   # Start website to test interactive examples
   yarn start
   # Navigate to http://localhost:3000/try-it-out
   # Test basic makeStyles examples work correctly in the interactive playground
   ```

2. **Build Tool Changes**: Test with actual build scenarios
   ```bash
   # Test TypeScript compatibility across versions
   yarn nx run @griffel/e2e-typescript:test
   
   # Test Next.js integration
   yarn nx run @griffel/e2e-nextjs:test
   
   # Test Rspack bundler integration
   yarn nx run @griffel/e2e-rspack:test
   ```

3. **Website Changes**: Verify documentation builds and renders
   ```bash
   yarn nx run @griffel/website:build
   # Check build succeeds without errors (warnings about broken anchors are acceptable)
   ```

### Code Quality Requirements
**ALWAYS run these before submitting changes:**
```bash
# Format code - required for CI
yarn prettier --write .

# Lint with automatic fixes where possible
yarn nx run-many --target=lint --all

# Type check everything
yarn nx run-many --target=type-check --all
```

### Change Management
```bash
# Create changelog entries (required for package changes)
yarn change
# Follow prompts to describe your changes
# Creates files in change/ directory for beachball
```

## Repository Structure

### Key Packages (packages/ directory)
- `@griffel/core` - Core runtime and compilation logic
- `@griffel/react` - React bindings and hooks  
- `@griffel/webpack-loader` - Webpack build-time transforms
- `@griffel/vite-plugin` - Vite build-time transforms
- `@griffel/next-extraction-plugin` - Next.js CSS extraction
- `@griffel/devtools` - Browser extension for debugging
- `@griffel/eslint-plugin` - ESLint rules for Griffel usage

### Applications (apps/ directory)
- `website` - Documentation site (Docusaurus) at griffel.js.org
- `benchmark` - Performance benchmarking suite

### Testing Infrastructure (e2e/ directory)
- `nextjs` - Next.js integration tests
- `typescript` - TypeScript compilation tests  
- `rspack` - Rspack bundler tests
- `utils` - Common E2E testing utilities

## Common Tasks

### Adding New Features
1. Make changes to relevant packages
2. Add/update tests in the same package
3. Run affected builds and tests to ensure nothing breaks
4. Create changelog entry: `yarn change`
5. Update documentation in `apps/website/docs/` if needed

### Debugging Build Issues
- Check package.json dependencies are correctly configured
- Use `yarn nx graph` to visualize project dependencies
- Individual package builds: `yarn nx run @griffel/[package]:build`
- Clear Nx cache if needed: `yarn nx reset`

### Working with Styles
- Test changes using the interactive playground at /try-it-out
- Validate CSS output using browser DevTools
- Check atomic CSS generation is working correctly
- Test SSR scenarios don't break hydration

## Known Issues and Workarounds

### Build Warnings (Acceptable)
- Some packages show rollup-plugin-typescript2 deprecation warnings - this is expected
- Linting may show 1-2 warnings in core packages - this is acceptable
- Prettier may flag some generated files in apps/website/.docusaurus/ - these can be ignored

### Storybook Issues
- React Storybook may have configuration issues with webpack5 dependencies
- Use the website's /try-it-out page for interactive testing instead


## Timeout Recommendations for Tools

**CRITICAL: Always set appropriate timeouts to prevent premature cancellation**

| Command | Expected Time | Recommended Timeout |
|---------|---------------|-------------------|
| `yarn install --immutable` (fresh) | 2 minutes | 300 seconds |
| `yarn install --immutable` (cached) | 20-30 seconds | 60 seconds |
| `yarn nx run-many --target=build --all` (fresh) | 1-2 minutes | 180 seconds |
| `yarn nx run-many --target=build --all` (cached) | 30-45 seconds | 120 seconds |
| `yarn nx run-many --target=test --all` | 3-4 minutes | 300 seconds |
| `yarn nx run-many --target=type-check --all` | 1-2 minutes | 180 seconds |
| `yarn nx run-many --target=lint --all` | 15-30 seconds | 60 seconds |
| `yarn start` (website) | 30-60 seconds | 120 seconds |
| `yarn nx run @griffel/website:build` | 20-30 seconds | 120 seconds |
| `yarn nx run @griffel/e2e-*:test` | 30-60 seconds | 120 seconds |

**NEVER CANCEL these commands early - builds may take longer than expected and timeouts should account for slower systems.**