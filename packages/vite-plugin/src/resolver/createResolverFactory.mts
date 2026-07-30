import { createTransformResolver, type TransformResolverOptions } from '@griffel/css-extraction-utils';
import type { TransformResolver } from '@griffel/transform';

export type ResolverFactoryOptions = TransformResolverOptions;
export type TransformResolverFactory = (options: ResolverFactoryOptions) => TransformResolver;

export function createResolverFactory(): TransformResolverFactory {
  return function (options: ResolverFactoryOptions = {}): TransformResolver {
    return createTransformResolver(options);
  };
}
