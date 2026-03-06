import { ResolverFactory, type NapiResolveOptions } from 'oxc-resolver';
import type { Compilation } from 'webpack';
import * as path from 'node:path';

import type { TransformResolver, TransformResolverFactory } from './types.mjs';

function isCJSOnlyPackage(id: string): boolean {
  return id === 'tslib' || id.startsWith('@babel/helpers') || id.startsWith('@swc/helpers/');
}

const RESOLVE_OPTIONS_DEFAULTS: NapiResolveOptions = {
  conditionNames: ['import', 'require'],
  extensions: ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
};

export function createESMResolverFactory(): TransformResolverFactory {
  return function (compilation: Compilation): TransformResolver {
    // ⚠ "this._compilation" limits loaders compatibility, however there seems to be no other way to access Webpack's
    // resolver.
    // There is this.resolve(), but it's asynchronous. Another option is to read the webpack.config.js, but it won't work
    // for programmatic usage. This API is used by many loaders/plugins, so hope we're safe for a while
    const resolveOptionsFromWebpackConfig = (compilation?.options.resolve ?? {}) as NapiResolveOptions;

    const defaultResolver = new ResolverFactory({
      ...RESOLVE_OPTIONS_DEFAULTS,
      ...resolveOptionsFromWebpackConfig,
    });

    // Clone shares the underlying cache, only overrides conditionNames
    const cjsResolver = defaultResolver.cloneWithOptions({
      conditionNames: ['require'],
    });

    return function resolveModule(id, { filename }) {
      const resolver = isCJSOnlyPackage(id) ? cjsResolver : defaultResolver;
      const resolved = resolver.sync(path.dirname(filename), id);

      if (resolved.error) {
        throw resolved.error;
      }
      if (!resolved.path) {
        throw new Error(`oxc-resolver: Failed to resolve module "${id}"`);
      }

      return resolved.path;
    };
  };
}
