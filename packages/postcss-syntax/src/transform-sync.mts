import NativeModule from 'node:module';
import { transformSync as griffelTransformSync } from '@griffel/transform';
import type { TransformOptions as GriffelTransformOptions, TransformMetadata, ModuleConfig } from '@griffel/transform';

export type { TransformMetadata, ModuleConfig };

export type TransformOptions = {
  filename: string;
  pluginOptions: {
    modules?: ModuleConfig[];
    generateMetadata?: boolean;
    evaluationRules?: GriffelTransformOptions['evaluationRules'];
  };
};

const EXTRA_EXTENSIONS = ['.ts', '.tsx', '.jsx', '.cjs'];

const nodeResolve: GriffelTransformOptions['resolveModule'] = (id, opts) => {
  const extensions = (NativeModule as unknown as { _extensions: Record<string, () => void> })._extensions;
  const added: string[] = [];

  try {
    for (const ext of EXTRA_EXTENSIONS) {
      if (!(ext in extensions)) {
        extensions[ext] = () => {};
        added.push(ext);
      }
    }

    return {
      path: (NativeModule as unknown as { _resolveFilename: (id: string, options: unknown) => string })._resolveFilename(
        id,
        opts,
      ),
      builtin: false,
    };
  } finally {
    for (const ext of added) {
      delete extensions[ext];
    }
  }
};

export default function transformSync(sourceCode: string, options: TransformOptions) {
  const { filename, pluginOptions } = options;
  const { modules, generateMetadata = false, evaluationRules } = pluginOptions;

  const result = griffelTransformSync(sourceCode, {
    filename,
    resolveModule: nodeResolve,
    generateMetadata,
    ...(modules && { modules }),
    ...(evaluationRules && { evaluationRules }),
  });

  return {
    metadata: result.metadata,
    code: result.code,
  };
}
