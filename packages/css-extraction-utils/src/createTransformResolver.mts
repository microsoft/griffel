import { ResolverFactory, type NapiResolveOptions } from 'oxc-resolver';
import type { TransformResolver } from '@griffel/transform';
import * as path from 'node:path';

/**
 * These packages ship helpers as CommonJS only, resolving them with the "import" condition picks an entry that cannot
 * be evaluated.
 */
function isCJSOnlyPackage(id: string): boolean {
  return id === 'tslib' || id.startsWith('@babel/runtime') || id.startsWith('@swc/helpers');
}

const RESOLVE_OPTIONS_DEFAULTS: NapiResolveOptions = {
  conditionNames: ['require'],
  extensions: ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
};

export type TransformResolverOptions = {
  /** Aliases applied while resolving, mirrors the `alias` option of a bundler. */
  alias?: NapiResolveOptions['alias'];
};

/**
 * Creates a resolver for imports inside modules that are evaluated during the transform.
 *
 * ⚠ Bundlers expose their own resolvers, but they are asynchronous while the Griffel transform is synchronous, so an
 * independent resolver is used instead.
 */
export function createTransformResolver(options: TransformResolverOptions = {}): TransformResolver {
  const { alias } = options;

  const cjsResolver = new ResolverFactory({
    ...RESOLVE_OPTIONS_DEFAULTS,
    ...(alias ? { alias } : null),
  });

  // Clone shares the underlying cache; extensions must be re-specified as cloneWithOptions does not persist them
  const esmResolver = cjsResolver.cloneWithOptions({
    ...RESOLVE_OPTIONS_DEFAULTS,
    ...(alias ? { alias } : null),
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
}
