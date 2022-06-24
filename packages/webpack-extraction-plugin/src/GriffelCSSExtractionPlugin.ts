import { Compilation } from 'webpack';
import type { Compiler, sources } from 'webpack';

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

  apply(compiler: Compiler): void {
    forceCSSIntoOneStyleSheet(compiler);

    compiler.hooks.compilation.tap('GriffelExtractPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'GriffelExtractPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        assets => {
          const griffelAsset = assets['griffel.css'];

          if (!griffelAsset) {
            return;
          }

          // TODO: implement sorting for buckets and media queries

          compilation.updateAsset(
            'griffel.css',
            new compiler.webpack.sources.RawSource(getAssetSourceContents(griffelAsset)),
          );
        },
      );
    });
  }
}
