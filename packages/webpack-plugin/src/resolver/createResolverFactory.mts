import { createTransformResolver } from '@griffel/css-extraction-utils';
import type { TransformResolver } from '@griffel/transform';
import type { Compilation } from 'webpack';

export type TransformResolverFactory = (compilation: Compilation) => TransformResolver;

export function createResolverFactory(): TransformResolverFactory {
  return function (_compilation: Compilation): TransformResolver {
    // ⚠ "this._compilation" limits loaders compatibility, however there seems to be no other way to access Webpack's
    // resolver.
    // There is this.resolve(), but it's asynchronous. Another option is to read the webpack.config.js, but it won't work
    // for programmatic usage. This API is used by many loaders/plugins, so hope we're safe for a while
    // const resolveOptionsFromWebpackConfig = (compilation?.options.resolve ?? {}) as NapiResolveOptions;

    return createTransformResolver();
  };
}
