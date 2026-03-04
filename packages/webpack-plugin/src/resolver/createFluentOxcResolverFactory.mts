import { ResolverFactory, type NapiResolveOptions } from 'oxc-resolver';
import type { Compilation } from 'webpack';
import * as path from 'node:path';

import type { TransformResolver, TransformResolverFactory } from './types.mjs';

export type FluentOxcResolverOptions = Pick<
  NapiResolveOptions,
  'conditionNames' | 'extensions' | 'alias' | 'mainFields' | 'modules'
> & {
  /** Predicate to determine if a module specifier should be resolved with ESM conditions. Defaults to matching `@fluentui/` prefixed packages. */
  isFluentPackage?: (id: string) => boolean;
};

function defaultIsFluentPackage(id: string): boolean {
  return id.startsWith('@fluentui/');
}

const RESOLVE_OPTIONS_DEFAULTS: NapiResolveOptions = {
  conditionNames: ['require'],
  extensions: ['.raw.js', '.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
};

export function createFluentOxcResolverFactory(resolveOptions?: FluentOxcResolverOptions): TransformResolverFactory {
  const { isFluentPackage = defaultIsFluentPackage, ...restOptions } = resolveOptions ?? {};

  return function (compilation: Compilation): TransformResolver {
    const defaultResolver = new ResolverFactory({
      ...RESOLVE_OPTIONS_DEFAULTS,
      ...restOptions,
    });

    // Clone shares the underlying cache, only overrides conditionNames
    const esmResolver = defaultResolver.cloneWithOptions({
      conditionNames: ['import', 'require'],
    });

    return function resolveModule(id, { filename }) {
      const resolver = isFluentPackage(id) ? esmResolver : defaultResolver;
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
