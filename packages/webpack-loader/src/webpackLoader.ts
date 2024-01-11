import type { BabelPluginOptions } from '@griffel/babel-preset';
import { EvalCache, Module } from '@griffel/babel-preset';
import * as enhancedResolve from 'enhanced-resolve';
import * as path from 'path';
import type * as webpack from 'webpack';

import type { TransformResult, TransformOptions } from './transformSync';
import { transformSync } from './transformSync';
import { optionsSchema } from './schema';

export type WebpackLoaderOptions = BabelPluginOptions & {
  inheritResolveOptions?: ('alias' | 'modules' | 'plugins' | 'conditionNames' | 'extensions')[];
  webpackResolveOptions?: Pick<
    Required<webpack.Configuration>['resolve'],
    'alias' | 'modules' | 'plugins' | 'conditionNames' | 'extensions'
  >;
};

type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;

export function shouldTransformSourceCode(
  sourceCode: string,
  modules: WebpackLoaderOptions['modules'] | undefined,
): boolean {
  // Fallback to "makeStyles" if options were not provided
  const imports = modules
    ? modules.flatMap(module => [module.importName, module.resetImportName || 'makeResetStyles']).join('|')
    : 'makeStyles|makeResetStyles';

  return new RegExp(`\\b(${imports}|makeResetStyles)`).test(sourceCode);
}

/**
 * Webpack can also pass sourcemaps as a string or null, Babel accepts only objects, boolean and undefined.
 * See https://github.com/babel/babel-loader/pull/889.
 */
function parseSourceMap(inputSourceMap: WebpackLoaderParams[1]): TransformOptions['inputSourceMap'] {
  try {
    if (typeof inputSourceMap === 'string') {
      return JSON.parse(inputSourceMap) as TransformOptions['inputSourceMap'];
    }

    if (inputSourceMap === null) {
      return undefined;
    }

    return inputSourceMap as TransformOptions['inputSourceMap'];
  } catch (err) {
    return undefined;
  }
}

export function webpackLoader(
  this: webpack.LoaderContext<WebpackLoaderOptions>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
) {
  // Loaders are cacheable by default, but there are edge cases/bugs when caching does not work until it's specified:
  // https://github.com/webpack/webpack/issues/14946
  this.cacheable();

  const {
    inheritResolveOptions = ['alias', 'modules', 'plugins'],
    webpackResolveOptions,
    ...babelConfig
  } = this.getOptions(optionsSchema);

  // Early return to handle cases when makeStyles() calls are not present, allows to avoid expensive invocation of Babel
  if (!shouldTransformSourceCode(sourceCode, babelConfig.modules)) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  EvalCache.clearForFile(this.resourcePath);

  const resolveOptionsDefaults: webpack.ResolveOptions = {
    conditionNames: ['require'],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  };
  // ⚠ "this._compilation" limits loaders compatibility, however there seems to be no other way to access Webpack's
  // resolver.
  // There is this.resolve(), but it's asynchronous. Another option is to read the webpack.config.js, but it won't work
  // for programmatic usage. This API is used by many loaders/plugins, so hope we're safe for a while
  const resolveOptionsFromWebpackConfig: webpack.ResolveOptions = this._compilation?.options.resolve || {};

  const resolveSync = enhancedResolve.create.sync({
    ...resolveOptionsDefaults,
    ...Object.fromEntries(
      inheritResolveOptions.map(resolveOptionKey => [
        resolveOptionKey,
        resolveOptionsFromWebpackConfig[resolveOptionKey],
      ]),
    ),
    ...webpackResolveOptions,
  });

  const originalResolveFilename = Module._resolveFilename;

  let result: TransformResult | null = null;
  let error: Error | null = null;

  try {
    // We are evaluating modules in Babel plugin to resolve expressions (function calls, imported constants, etc.) in
    // makeStyles() calls, see evaluatePathsInVM.ts.
    // Webpack's config can define own module resolution, Babel plugin should use Webpack's resolution to properly
    // resolve paths.
    Module._resolveFilename = (id, { filename }) => {
      const resolvedPath = resolveSync(path.dirname(filename), id);

      if (!resolvedPath) {
        throw new Error(`enhanced-resolve: Failed to resolve module "${id}"`);
      }

      this.addDependency(resolvedPath);

      return resolvedPath;
    };

    result = transformSync(sourceCode, {
      filename: path.relative(process.cwd(), this.resourcePath),

      enableSourceMaps: this.sourceMap || false,
      inputSourceMap: parseSourceMap(inputSourceMap),

      pluginOptions: babelConfig,
    });
  } catch (err) {
    error = err as Error;
  } finally {
    // Restore original behaviour
    Module._resolveFilename = originalResolveFilename;
  }

  if (result) {
    this.callback(null, result.code, result.sourceMap);
    return;
  }

  this.callback(error);
}
