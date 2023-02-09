import { defaultCompareMediaQueries, GriffelRenderer } from '@griffel/core';
import { Compilation } from 'webpack';
import type { Chunk, Compiler, Module, sources } from 'webpack';

import { GriffelDummyModule } from './GriffelDummyModule';
import { parseCSSRules } from './parseCSSRules';
import { sortCSSRules } from './sortCSSRules';

// Webpack does not export these constants
// https://github.com/webpack/webpack/blob/b67626c7b4ffed8737d195b27c8cea1e68d58134/lib/OptimizationStages.js#L8
const OPTIMIZE_CHUNKS_STAGE_BASIC = -10;

export type GriffelCSSExtractionPluginOptions = {
  compareMediaQueries?: GriffelRenderer['compareMediaQueries'];
  unstable_attachToMainEntryPoint?: boolean;
};

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

function isCSSModule(module: Module): module is CSSModule {
  return module.type === 'css/mini-extract';
}

function isGriffelCSSModule(module: Module): boolean {
  if (isCSSModule(module)) {
    if (Buffer.isBuffer(module.content)) {
      const content = module.content.toString('utf-8');

      return content.indexOf('/** @griffel:css-start') !== -1;
    }
  }

  return false;
}

function moveCSSModulesToGriffelChunk(compilation: Compilation, attachToMainEntryPoint: boolean) {
  const griffelChunk = compilation.namedChunks.get('griffel');

  if (!griffelChunk) {
    return;
  }

  const matchingChunks = new Set<Chunk>();
  let moduleIndex = 0;

  for (const module of compilation.modules) {
    if (isGriffelCSSModule(module)) {
      const moduleChunks = compilation.chunkGraph.getModuleChunksIterable(module);

      for (const chunk of moduleChunks) {
        compilation.chunkGraph.disconnectChunkAndModule(chunk, module);

        for (const group of chunk.groupsIterable) {
          group.setModulePostOrderIndex(module, moduleIndex++);
        }

        matchingChunks.add(chunk);
      }

      compilation.chunkGraph.connectChunkAndModule(griffelChunk, module);
    }
  }

  if (!attachToMainEntryPoint) {
    for (const chunk of matchingChunks) {
      chunk.split(griffelChunk);
    }
  }
}

export class GriffelCSSExtractionPlugin {
  static loader = require.resolve('./webpackLoader');

  private readonly attachToMainEntryPoint: NonNullable<
    GriffelCSSExtractionPluginOptions['unstable_attachToMainEntryPoint']
  >;
  private readonly compareMediaQueries: NonNullable<GriffelCSSExtractionPluginOptions['compareMediaQueries']>;

  constructor(options?: GriffelCSSExtractionPluginOptions) {
    this.attachToMainEntryPoint = options?.unstable_attachToMainEntryPoint ?? false;
    this.compareMediaQueries = options?.compareMediaQueries ?? defaultCompareMediaQueries;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // A chunk where we will move all CSS modules
      const griffelChunk = compilation.addChunk('griffel');
      // Set up a dummy module to prevent the chunk from getting cleaned up by RemoveEmptyChunksPlugin
      const dummyModule = new GriffelDummyModule();

      if (this.attachToMainEntryPoint) {
        compilation.hooks.afterChunks.tap(PLUGIN_NAME, () => {
          attachGriffelChunkToMainEntryPoint(compilation, griffelChunk);
        });
      }

      // Adds dummy module here to try to make sure that other module optimization steps won't conflict
      compilation.hooks.afterOptimizeModules.tap(PLUGIN_NAME, () => {
        compilation.modules.add(dummyModule);
        compilation.chunkGraph.connectChunkAndModule(griffelChunk, dummyModule);
      });

      // Performs movements before SplitChunksPlugin
      compilation.hooks.optimizeChunks.tap({ name: PLUGIN_NAME, stage: OPTIMIZE_CHUNKS_STAGE_BASIC }, () => {
        moveCSSModulesToGriffelChunk(compilation, this.attachToMainEntryPoint);
      });

      compilation.hooks.afterOptimizeChunks.tap(PLUGIN_NAME, () => {
        // If SplitChunksPlugin has configured "cacheGroups", we need to move chunks again to ensure that needed
        // modules are still attached "griffel" chunk
        if (compiler.options.optimization.splitChunks && compiler.options.optimization.splitChunks.cacheGroups) {
          moveCSSModulesToGriffelChunk(compilation, this.attachToMainEntryPoint);
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
