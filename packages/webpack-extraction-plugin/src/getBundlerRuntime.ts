import type { Compilation, NormalModule } from 'webpack';

type BundlerRuntime = {
  Compilation: typeof Compilation;
  NormalModule: typeof NormalModule;
};

let bundlerRuntime: BundlerRuntime | null = null;

export function getBundlerRuntime(type: 'webpack' | 'rspack'): BundlerRuntime {
  if (bundlerRuntime === null) {
    // eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-require-imports
    bundlerRuntime = type === 'webpack' ? require('webpack') : require('@rspack/core');
  }

  return bundlerRuntime!;
}
