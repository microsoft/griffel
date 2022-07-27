import { defaultCompareMediaQueries, GriffelRenderer } from '@griffel/core';
import { Compilation } from 'webpack';
import type { Compiler, sources } from 'webpack';

import { sortCSSRules } from './sortCSSRules';

type GriffelCSSExtractionPluginOptions = {
  compareMediaQueries?: GriffelRenderer['compareMediaQueries'];
};

/**
 * Forces all files with `griffel.css` be concatenated into a single asset.
 */
function forceCSSIntoOneStyleSheet(compiler: Compiler) {
  compiler.options.optimization ??= {};
  compiler.options.optimization.splitChunks ??= {};
  compiler.options.optimization.splitChunks.cacheGroups ??= {};

  compiler.options.optimization.splitChunks.cacheGroups['griffel'] = {
    name: `griffel`,
    type: 'css/mini-extract',
    chunks: 'all',
    test: /virtual-loader\/griffel\.css$/,
    enforce: true,
  };
}

function getAssetSourceContents(assetSource: sources.Source): string {
  const source = assetSource.source();

  if (typeof source === 'string') {
    return source;
  }

  return source.toString();
}

export class GriffelCSSExtractionPlugin {
  static loader = require.resolve('./webpackLoader');

  private readonly compareMediaQueries: NonNullable<GriffelCSSExtractionPluginOptions['compareMediaQueries']>;

  constructor(options?: GriffelCSSExtractionPluginOptions) {
    this.compareMediaQueries = options?.compareMediaQueries ?? defaultCompareMediaQueries;
  }

  apply(compiler: Compiler): void {
    forceCSSIntoOneStyleSheet(compiler);

    compiler.hooks.compilation.tap('GriffelExtractPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'GriffelExtractPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        assets => {
          const griffelAsset = Object.entries(assets).find(([assetName]) => assetName.includes('griffel'));

          if (!griffelAsset) {
            return;
          }

          const [assetName, assetSource] = griffelAsset;

          const unsortedCSSRules = getAssetSourceContents(assetSource);
          const sortedCSSRules = sortCSSRules(unsortedCSSRules, this.compareMediaQueries);

          compilation.updateAsset(assetName, new compiler.webpack.sources.RawSource(sortedCSSRules));
        },
      );
    });
  }
}
