import { defaultCompareMediaQueries, GriffelRenderer } from '@griffel/core';
import { Compilation } from 'webpack';
import type { Chunk, Compiler, Module, sources } from 'webpack';

import { GriffelDummyModule } from './GriffelDummyModule';
import { parseCSSRules } from './parseCSSRules';
import { sortCSSRules } from './sortCSSRules';

export type GriffelCSSExtractionPluginOptions = {
  compareMediaQueries?: GriffelRenderer['compareMediaQueries'];
};

type IterableElement<TargetIterable> = TargetIterable extends Iterable<infer ElementType> ? ElementType : never;
type ChunkGroup = IterableElement<Chunk['groupsIterable']>;

const PLUGIN_NAME = 'GriffelExtractPlugin';

function getAssetSourceContents(assetSource: sources.Source): string {
  const source = assetSource.source();

  if (typeof source === 'string') {
    return source;
  }

  return source.toString();
}

// https://github.com/webpack-contrib/mini-css-extract-plugin/blob/26334462e419026086856787d672b052cd916c62/src/index.js#L90
type CSSModule = Module & {
  content: Buffer;
};

function isGriffelCSSModule(module: CSSModule): boolean {
  if (Buffer.isBuffer(module.content)) {
    const content = module.content.toString('utf-8');

    return content.indexOf('/** @griffel:css-start') !== -1;
  }

  return false;
}

function findMatchingEntities(compilation: Compilation, chunks: Iterable<Chunk>, griffelChunk: Chunk) {
  const matchingChunks = new Set<Chunk>();
  const matchingCSSModules = new Set<CSSModule>();

  for (const chunk of chunks) {
    if (chunk === griffelChunk) {
      continue;
    }

    // https://github.com/webpack-contrib/mini-css-extract-plugin/blob/26334462e419026086856787d672b052cd916c62/src/index.js#L693-L697
    const cssModules = compilation.chunkGraph.getChunkModulesIterableBySourceType(chunk, 'css/mini-extract') as
      | Iterable<CSSModule>
      | undefined;

    if (typeof cssModules === 'undefined') {
      continue;
    }

    for (const cssModule of cssModules) {
      if (isGriffelCSSModule(cssModule)) {
        matchingChunks.add(chunk);
        matchingCSSModules.add(cssModule);
      }
    }
  }

  return { matchingChunks, matchingCSSModules };
}

export class GriffelCSSExtractionPlugin {
  static loader = require.resolve('./webpackLoader');

  private readonly compareMediaQueries: NonNullable<GriffelCSSExtractionPluginOptions['compareMediaQueries']>;

  constructor(options?: GriffelCSSExtractionPluginOptions) {
    this.compareMediaQueries = options?.compareMediaQueries ?? defaultCompareMediaQueries;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // A chunk where we will move all CSS modules
      const griffelChunk = compilation.addChunk('griffel');
      // Set up a dummy module to prevent the chunk from getting cleaned up by RemoveEmptyChunksPlugin
      const dummyModule = new GriffelDummyModule();

      compilation.hooks.afterOptimizeModules.tap(PLUGIN_NAME, () => {
        // Adds dummy module to try to make sure that other module optimization steps won't conflict
        compilation.modules.add(dummyModule);
        compilation.chunkGraph.connectChunkAndModule(griffelChunk, dummyModule);
      });

      compilation.hooks.afterOptimizeChunks.tap(PLUGIN_NAME, chunks => {
        const { matchingChunks, matchingCSSModules } = findMatchingEntities(compilation, chunks, griffelChunk);

        for (const chunk of matchingChunks) {
          chunk.split(griffelChunk);
        }

        for (const module of matchingCSSModules) {
          for (const chunk of matchingChunks) {
            compilation.chunkGraph.disconnectChunkAndModule(chunk, module);
          }

          compilation.chunkGraph.connectChunkAndModule(griffelChunk, module);
        }

        // Remove dummy module once we are sure chunk optimization steps have finished. i.e. won't conflict with
        // SplitChunksPlugin
        compilation.modules.delete(dummyModule);
        compilation.chunkGraph.disconnectChunkAndModule(griffelChunk, dummyModule);
      });

      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        assets => {
          const cssAssetDetails = Object.entries(assets).find(([assetName]) => griffelChunk.files.has(assetName));

          if (typeof cssAssetDetails === 'undefined') {
            return;
          }

          const [cssAssetName, cssAssetSource] = cssAssetDetails;

          const cssContent = getAssetSourceContents(cssAssetSource);
          const { cssRulesByBucket, remainingCSS } = parseCSSRules(cssContent);

          const cssSource = sortCSSRules([cssRulesByBucket], this.compareMediaQueries);

          compilation.updateAsset(cssAssetName, new compiler.webpack.sources.RawSource(remainingCSS + cssSource));
        },
      );
    });
  }
}
