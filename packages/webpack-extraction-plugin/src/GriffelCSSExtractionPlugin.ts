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

function attachGriffelChunkToMainEntryPoint(compilation: Compilation, griffelChunk: Chunk) {
  const entryPoints = Array.from(compilation.entrypoints.values());

  if (entryPoints.length === 0) {
    return;
  }

  const mainEntryPoint = entryPoints[0];
  const targetChunk = mainEntryPoint.getEntrypointChunk();
  const targetChunkGroup = Array.from(targetChunk.groupsIterable)[0];

  mainEntryPoint.pushChunk(griffelChunk);

  // It's mandatory to have the chunk in a group, otherwise ".groupsIterable" will be empty and will fail mini-css-extract
  // https://github.com/webpack-contrib/mini-css-extract-plugin/blob/26334462e419026086856787d672b052cd916c62/src/index.js#L1125-L1130
  griffelChunk.addGroup(targetChunkGroup);
}

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

function isGriffelCSSModule(cssModule: CSSModule): boolean {
  if (Buffer.isBuffer(cssModule.content)) {
    const content = cssModule.content.toString('utf-8');

    return content.indexOf('/** @griffel:css-start') !== -1;
  }

  return false;
}

function ensureModuleHasPostOrderIndex(griffelChunk: Chunk, cssModule: Module) {
  for (const group of griffelChunk.groupsIterable) {
    if (group.getModulePostOrderIndex(cssModule)) {
      continue;
    }

    // "mini-css-extract" requires an index to exist on modules. A module with an index will be filtered out and the plugin will throw
    // https://github.com/webpack-contrib/mini-css-extract-plugin/blob/26334462e419026086856787d672b052cd916c62/src/index.js#L1133-L1140
    group.setModulePostOrderIndex(
      cssModule,
      // It's bad to use private APIs, but it's more reliable than random indexes
      // The same approach is used in Gatsby
      // https://github.com/gatsbyjs/gatsby/blob/0b3c34c2bf932e5486ad2d0c3589bde6dc818661/packages/gatsby/src/utils/webpack/plugins/partial-hydration.ts#L455-L463
      // https://github.com/webpack/webpack/blob/e184a03f2504f03b2e30091662df6630a99a5f72/lib/ChunkGroup.js#L98-L99
      (group as ChunkGroup & { _modulePostOrderIndices: Map<Module, number> })._modulePostOrderIndices.size + 1,
    );
  }
}

function moveCSSModulesToGriffelChunk(compilation: Compilation, chunks: Iterable<Chunk>, griffelChunk: Chunk) {
  for (const chunk of chunks) {
    if (chunk === griffelChunk) {
      continue;
    }

    // https://github.com/webpack-contrib/mini-css-extract-plugin/blob/26334462e419026086856787d672b052cd916c62/src/index.js#L693-L697
    const cssModules = compilation.chunkGraph.getChunkModulesIterableBySourceType(chunk, 'css/mini-extract');

    if (typeof cssModules === 'undefined') {
      continue;
    }

    for (const cssModule of cssModules) {
      if (!isGriffelCSSModule(cssModule as CSSModule)) {
        continue;
      }

      // https://github.com/webpack/webpack/blob/8241da7f1e75c5581ba535d127fa66aeb9eb2ac8/lib/Chunk.js#L245-L253
      compilation.chunkGraph.disconnectChunkAndModule(chunk, cssModule);
      compilation.chunkGraph.connectChunkAndModule(griffelChunk, cssModule);

      ensureModuleHasPostOrderIndex(griffelChunk, cssModule);
    }
  }
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

      compilation.hooks.afterChunks.tap(PLUGIN_NAME, () => {
        attachGriffelChunkToMainEntryPoint(compilation, griffelChunk);
      });

      compilation.hooks.afterOptimizeModules.tap(PLUGIN_NAME, () => {
        compilation.modules.add(dummyModule);
        compilation.chunkGraph.connectChunkAndModule(griffelChunk, dummyModule);
      });

      compilation.hooks.afterOptimizeChunks.tap(PLUGIN_NAME, chunks => {
        moveCSSModulesToGriffelChunk(compilation, chunks, griffelChunk);

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
