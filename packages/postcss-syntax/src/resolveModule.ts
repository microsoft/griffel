import NativeModule from 'node:module';
import type { TransformOptions as GriffelTransformOptions } from '@griffel/transform';

const EXTRA_EXTENSIONS = ['.ts', '.tsx', '.jsx', '.cjs'];

/**
 * A Node based module resolver for `@griffel/transform`. In addition to the extensions that Node
 * resolves by default it also accepts TypeScript/JSX extensions by temporarily registering them
 * with Node's resolver, so imports inside `.ts`/`.tsx` style files can be resolved.
 */
export const nodeResolve: GriffelTransformOptions['resolveModule'] = (id, opts) => {
  const extensions = (NativeModule as unknown as { _extensions: Record<string, () => void> })._extensions;
  const added: string[] = [];

  try {
    for (const ext of EXTRA_EXTENSIONS) {
      if (!(ext in extensions)) {
        extensions[ext] = () => {
          /* no-op: registers the extension so Node's resolver accepts it */
        };
        added.push(ext);
      }
    }

    return {
      path: (
        NativeModule as unknown as { _resolveFilename: (id: string, options: unknown) => string }
      )._resolveFilename(id, opts),
      builtin: false,
    };
  } finally {
    for (const ext of added) {
      delete extensions[ext];
    }
  }
};
