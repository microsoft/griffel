import * as Babel from '@babel/core';
import type { BabelPluginMetadata, BabelPluginOptions } from '@griffel/babel-preset';
import griffelPreset from '@griffel/babel-preset';
import type { LocationPluginMetadata } from './location-preset';
import locationPreset from './location-preset';

export type TransformOptions = {
  filename: string;
  pluginOptions: BabelPluginOptions;
};

/**
 * Transforms passed source code with Babel, uses user's config for parsing, but ignores it for transforms.
 */
export default function transformSync(sourceCode: string, options: TransformOptions) {
  const { plugins, presets } = options.pluginOptions.babelOptions ?? { plugins: [], presets: [] };
  const babelFileResult = Babel.transformSync(sourceCode, {
    // Ignore all user's configs and apply only our plugin
    babelrc: false,
    configFile: false,
    plugins,
    presets: [...(presets ?? []), [griffelPreset, options.pluginOptions], [locationPreset, options.pluginOptions]],

    filename: options.filename,
    sourceFileName: options.filename,
  });

  if (babelFileResult === null) {
    throw new Error(`Failed to transform "${options.filename}" due unknown Babel error...`);
  }

  return {
    metadata: babelFileResult.metadata as unknown as BabelPluginMetadata & LocationPluginMetadata,
    code: babelFileResult.code,
  };
}
