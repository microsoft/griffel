import { ResolverFactory, type NapiResolveOptions } from 'oxc-resolver';
import type { TransformResolver } from '@griffel/transform';
import * as path from 'node:path';

function isCJSOnlyPackage(id: string): boolean {
  return id === 'tslib' || id.startsWith('@babel/runtime') || id.startsWith('@swc/helpers');
}

const RESOLVE_OPTIONS_DEFAULTS: NapiResolveOptions = {
  conditionNames: ['require'],
  extensions: ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
};

/**
 * Creates a resolver used to resolve imports inside modules that are evaluated during the transform.
 *
 * ⚠ Vite's own resolver (`this.resolve()`) is asynchronous, while the Griffel transform is synchronous, so an
 * independent resolver is used instead. `alias` from the Vite config is passed in to keep custom aliases working.
 */
export function createResolverFactory(): TransformResolverFactory {
  return function (options: ResolverFactoryOptions = {}): TransformResolver {
    const cjsResolver = new ResolverFactory({
      ...RESOLVE_OPTIONS_DEFAULTS,
      ...(options.alias ? { alias: options.alias } : null),
    });

    // Clone shares the underlying cache; extensions must be re-specified as cloneWithOptions does not persist them
    const esmResolver = cjsResolver.cloneWithOptions({
      ...RESOLVE_OPTIONS_DEFAULTS,
      ...(options.alias ? { alias: options.alias } : null),
      conditionNames: ['import'],
      mainFields: ['module', 'main'],
    });

    return function resolveModule(id, { filename }) {
      const resolver = isCJSOnlyPackage(id) ? cjsResolver : esmResolver;
      const resolved = resolver.sync(path.dirname(filename), id);

      if (resolved.error) {
        throw resolved.error;
      }

      if (!resolved.path) {
        throw new Error(`oxc-resolver: Failed to resolve module "${id}"`);
      }

      return {
        path: resolved.path,
        builtin: !!resolved.builtin,
      };
    };
  };
}

export type ResolverFactoryOptions = {
  /** Aliases derived from `resolve.alias` of the Vite config. */
  alias?: NapiResolveOptions['alias'];
};

export type TransformResolverFactory = (options: ResolverFactoryOptions) => TransformResolver;
