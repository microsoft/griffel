import { ResolverFactory, type NapiResolveOptions } from 'oxc-resolver';
import type { Compilation } from 'webpack';
import * as path from 'node:path';

import type { TransformResolver, TransformResolverFactory } from './types.mjs';

function isCJSOnlyPackage(id: string): boolean {
  return id === 'tslib' || id.startsWith('@babel/runtime') || id.startsWith('@swc/helpers');
}

const RESOLVE_OPTIONS_DEFAULTS: NapiResolveOptions = {
  conditionNames: ['require'],
  extensions: ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
};

export function createResolverFactory(): TransformResolverFactory {
  return function (compilation: Compilation): TransformResolver {
    // ⚠ "this._compilation" limits loaders compatibility, however there seems to be no other way to access Webpack's
    // resolver.
    // There is this.resolve(), but it's asynchronous. Another option is to read the webpack.config.js, but it won't work
    // for programmatic usage. This API is used by many loaders/plugins, so hope we're safe for a while
    // const resolveOptionsFromWebpackConfig = (compilation?.options.resolve ?? {}) as NapiResolveOptions;

    const cjsResolver = new ResolverFactory({
      ...RESOLVE_OPTIONS_DEFAULTS,
      // ...resolveOptionsFromWebpackConfig,
    });

    // Clone shares the underlying cache; extensions must be re-specified as cloneWithOptions does not persist them
    const esmResolver = cjsResolver.cloneWithOptions({
      ...RESOLVE_OPTIONS_DEFAULTS,
      conditionNames: ['import'],
      mainFields: ['module', 'main'],
    });

    return function resolveModule(id: string, { filename }: { filename: string }) {
      const resolver = isCJSOnlyPackage(id) ? cjsResolver : esmResolver;
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
