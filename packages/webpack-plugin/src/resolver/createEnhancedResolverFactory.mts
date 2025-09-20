import enhancedResolve, { type ResolveOptionsOptionalFS } from 'enhanced-resolve';
import type { Compilation, Configuration } from 'webpack';
import * as path from 'node:path';

import type { TransformResolver, TransformResolverFactory } from './types.mjs';

type EnhancedResolveOptions = Pick<
  ResolveOptionsOptionalFS,
  'alias' | 'conditionNames' | 'extensions' | 'modules' | 'plugins'
>;

const RESOLVE_OPTIONS_DEFAULTS: EnhancedResolveOptions = {
  conditionNames: ['require'],
  extensions: ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
};

export function createEnhancedResolverFactory(
  resolveOptions: {
    inheritResolveOptions?: ('alias' | 'modules' | 'plugins' | 'conditionNames' | 'extensions')[];
    webpackResolveOptions?: Pick<
      Required<Configuration>['resolve'],
      'alias' | 'modules' | 'plugins' | 'conditionNames' | 'extensions'
    >;
  } = {},
): TransformResolverFactory {
  const { inheritResolveOptions = ['alias', 'modules', 'plugins'], webpackResolveOptions } = resolveOptions;

  return function (compilation: Compilation): TransformResolver {
    // ⚠ "this._compilation" limits loaders compatibility, however there seems to be no other way to access Webpack's
    // resolver.
    // There is this.resolve(), but it's asynchronous. Another option is to read the webpack.config.js, but it won't work
    // for programmatic usage. This API is used by many loaders/plugins, so hope we're safe for a while
    const resolveOptionsFromWebpackConfig = (compilation?.options.resolve ?? {}) as EnhancedResolveOptions;

    const resolveSync = enhancedResolve.create.sync({
      ...RESOLVE_OPTIONS_DEFAULTS,
      ...Object.fromEntries(
        inheritResolveOptions.map(resolveOptionKey => [
          resolveOptionKey,
          resolveOptionsFromWebpackConfig[resolveOptionKey],
        ]),
      ),
      ...(webpackResolveOptions as EnhancedResolveOptions),
    });

    return function resolveModule(id, { filename }) {
      const resolvedPath = resolveSync(path.dirname(filename), id);

      if (!resolvedPath) {
        throw new Error(`enhanced-resolve: Failed to resolve module "${id}"`);
      }

      return resolvedPath;
    };
  };
}
