import * as Babel from '@babel/core';
import { babelPluginStripGriffelRuntime, StripRuntimeBabelPluginMetadata } from './babelPluginStripGriffelRuntime';

export type TransformOptions = {
  filename: string;

  inputSourceMap: Babel.TransformOptions['inputSourceMap'];
  enableSourceMaps: boolean;
};

export type TransformResult = {
  code: string;
  cssRules: string[] | undefined;
  sourceMap: NonNullable<Babel.BabelFileResult['map']> | undefined;
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
    inputSourceMap: options.inputSourceMap,
    sourceMaps: options.enableSourceMaps,
  });

  if (babelAST === null) {
    throw new Error(`Failed to create AST for "${options.filename}" due unknown Babel error...`);
  }

  const babelFileResult = Babel.transformFromAstSync(babelAST, sourceCode, {
    // Ignore all user's configs and apply only our plugin
    babelrc: false,
    configFile: false,
    plugins: [babelPluginStripGriffelRuntime],

    filename: options.filename,

    sourceMaps: options.enableSourceMaps,
    sourceFileName: options.filename,
    inputSourceMap: options.inputSourceMap,
  });

  if (babelFileResult === null) {
    throw new Error(`Failed to transform "${options.filename}" due unknown Babel error...`);
  }

  return {
    code: babelFileResult.code as string,
    cssRules: (babelFileResult.metadata as unknown as StripRuntimeBabelPluginMetadata).cssRules,
    sourceMap: babelFileResult.map === null ? undefined : babelFileResult.map,
  };
}
