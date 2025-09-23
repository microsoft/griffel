import { ResolverFactory, type NapiResolveOptions } from 'oxc-resolver';
import type { Compilation } from 'webpack';
import * as path from 'node:path';

import type { TransformResolver, TransformResolverFactory } from './types.mjs';

const RESOLVE_OPTIONS_DEFAULTS: NapiResolveOptions = {
  conditionNames: ['require'],
  extensions: ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
};

export function createOxcResolverFactory(): TransformResolverFactory {
  return function (compilation: Compilation): TransformResolver {
    // ⚠ "this._compilation" limits loaders compatibility, however there seems to be no other way to access Webpack's
    // resolver.
    // There is this.resolve(), but it's asynchronous. Another option is to read the webpack.config.js, but it won't work
    // for programmatic usage. This API is used by many loaders/plugins, so hope we're safe for a while
    // const resolveOptionsFromWebpackConfig = (compilation?.options.resolve ?? {}) as NapiResolveOptions;

    const resolverFactory = new ResolverFactory({
      ...RESOLVE_OPTIONS_DEFAULTS,
      // ...resolveOptionsFromWebpackConfig,
    });

    return function resolveModule(id: string, { filename }: { filename: string }) {
      const resolvedResolver = resolverFactory.sync(path.dirname(filename), id);

      if (resolvedResolver.error) {
        throw resolvedResolver.error;
      }

      if (!resolvedResolver.path) {
        throw new Error(`oxc-resolver: Failed to resolve module "${id}"`);
      }

      return resolvedResolver.path;
    };
  };
}
