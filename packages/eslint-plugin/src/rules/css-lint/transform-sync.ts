import * as Babel from '@babel/core';
import griffelPreset, { BabelPluginMetadata, BabelPluginOptions } from '@griffel/babel-preset';

export type TransformOptions = {
  filename: string;
  pluginOptions: BabelPluginOptions;
};

export type TransformResult = {
  code: string;
  metadata: BabelPluginMetadata;
};

/**
 * Transforms passed source code with Babel, uses user's config for parsing, but ignores it for transforms.
 */
export function transformSync(sourceCode: string, options: TransformOptions): TransformResult {
  // Parse the code first so Babel will use user's babel config for parsing
  // During transforms we don't want to use user's config
  const babelAST = Babel.parseSync(sourceCode, {
    caller: { name: 'griffel' },
    filename: options.filename,
    // TODO - we might need to add some babel config in the eslint rule options
    // if the user doesn't want to use their normal babel config for this
    // but let's only add it if it becomes necessary
  });

  if (babelAST === null) {
    throw new Error(`Failed to create AST for "${options.filename}" due unknown Babel error...`);
  }

  const babelFileResult = Babel.transformFromAstSync(babelAST, sourceCode, {
    // Ignore all user's configs and apply only our plugin
    babelrc: false,
    configFile: false,
    presets: [[griffelPreset, options.pluginOptions]],

    filename: options.filename,
    sourceFileName: options.filename,
  });

  if (babelFileResult === null) {
    throw new Error(`Failed to transform "${options.filename}" due unknown Babel error...`);
  }

  return {
    metadata: babelFileResult.metadata as unknown as BabelPluginMetadata,
    code: babelFileResult.code as string,
  };
}
