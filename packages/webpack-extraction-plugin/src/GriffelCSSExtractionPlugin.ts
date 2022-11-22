import { defaultCompareMediaQueries, GriffelRenderer } from '@griffel/core';
import { Compilation } from 'webpack';
import type { Compiler, sources } from 'webpack';

import { sortCSSRules } from './sortCSSRules';

export type GriffelCSSExtractionPluginOptions = {
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
    test: /griffel.css/,
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
      if (compilation.hooks.optimizeAssets) {
        compilation.hooks.optimizeAssets.tap('GriffelExtractPlugin', assets =>
          updateGriffelCSS(assets, compiler, compilation, this.compareMediaQueries),
        );
      } else {
        compilation.hooks.processAssets.tap(
          {
            name: 'GriffelExtractPlugin',
            stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
          },
          assets => updateGriffelCSS(assets, compiler, compilation, this.compareMediaQueries),
        );
      }
    });
  }
}

const updateGriffelCSS = (
  assets: Compilation['assets'],
  compiler: Compiler,
  compilation: Compilation,
  compareMediaQueries: GriffelRenderer['compareMediaQueries'],
) => {
  const griffelAsset = Object.entries(assets).find(
    ([assetName]) => assetName.includes('griffel') && assetName.endsWith('.css'),
  );

  if (!griffelAsset) {
    return;
  }

  const [assetName, assetSource] = griffelAsset;
  const unsortedCSSRules = getAssetSourceContents(assetSource);
  const sortedCSSRules = sortCSSRules(unsortedCSSRules, compareMediaQueries);

  const webpack = compiler.webpack ? compiler.webpack : require('webpack');

  compilation.updateAsset(assetName, new webpack.sources.RawSource(sortedCSSRules));
};
