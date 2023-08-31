import { defaultCompareMediaQueries, GriffelRenderer } from '@griffel/core';
import { Compilation, NormalModule } from 'webpack';
import type { Chunk, Compiler, Module, sources } from 'webpack';

import { parseCSSRules } from './parseCSSRules';
import { sortCSSRules } from './sortCSSRules';
import { PLUGIN_NAME, GriffelCssLoaderContextKey, type SupplementedLoaderContext } from './constants';

// Webpack does not export these constants
// https://github.com/webpack/webpack/blob/b67626c7b4ffed8737d195b27c8cea1e68d58134/lib/OptimizationStages.js#L8
const OPTIMIZE_CHUNKS_STAGE_ADVANCED = 10;

export type GriffelCSSExtractionPluginOptions = {
  compareMediaQueries?: GriffelRenderer['compareMediaQueries'];
  unstable_attachToMainEntryPoint?: boolean;
};

function attachGriffelChunkToMainEntryPoint(compilation: Compilation, griffelChunk: Chunk) {
  const entryPoints = Array.from(compilation.entrypoints.values());

  if (entryPoints.length === 0) {
    return;
  }

  const mainEntryPoint = entryPoints[0];
  const targetChunk = mainEntryPoint.getEntrypointChunk();

  targetChunk.split(griffelChunk);
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

function moveCSSModulesToGriffelChunk(compilation: Compilation) {
  let griffelChunk = compilation.namedChunks.get('griffel');

  if (!griffelChunk) {
    griffelChunk = compilation.addChunk('griffel');
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

  for (const chunk of matchingChunks) {
    chunk.split(griffelChunk);
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
    // WHAT?
    //   Prevents ".griffel.css" files from being tree shaken by forcing "sideEffects" setting.
    // WHY?
    //   The extraction loader adds `import ""` statements that trigger virtual loader. Modules created by this loader
    //   will have paths relative to source file. To identify what files have side effects Webpack relies on
    //   "sideEffects" field in "package.json" and NPM packages usually have "sideEffects: false" that will trigger
    //   Webpack to shake out generated CSS.
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, nmf => {
      nmf.hooks.createModule.tap(
        PLUGIN_NAME,
        // @ts-expect-error CreateData is typed as 'object'...
        (createData: { matchResource?: string; settings: { sideEffects?: boolean } }) => {
          if (createData.matchResource && createData.matchResource.endsWith('.griffel.css')) {
            createData.settings.sideEffects = true;
          }
        },
      );
    });

    // WHAT?
    //  Forces all modules emitted by an extraction loader to be moved in a single chunk by SplitChunksPlugin config.
    // WHY?
    //  We need to sort CSS rules in the same order as it's done via style buckets. It's not possible in multiple
    //  chunks.
    if (compiler.options.optimization.splitChunks) {
      compiler.options.optimization.splitChunks.cacheGroups ??= {};
      compiler.options.optimization.splitChunks.cacheGroups['griffel'] = {
        name: 'griffel',
        test: isGriffelCSSModule,
        chunks: 'all',
        enforce: true,
      };
    }

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // WHAT?
      //   Adds a callback to the loader context
      // WHY?
      //   Allows us to register the CSS extracted from Griffel calls to then process in a CSS module
      const cssByModuleMap = new Map<string, string>();

      NormalModule.getCompilationHooks(compilation).loader.tap(PLUGIN_NAME, (loaderContext, module) => {
        const resourcePath = module.resource;

        (loaderContext as SupplementedLoaderContext)[GriffelCssLoaderContextKey] = {
          registerExtractedCss(css: string) {
            cssByModuleMap.set(resourcePath, css);
          },
          getExtractedCss() {
            const css = cssByModuleMap.get(resourcePath) ?? '';
            cssByModuleMap.delete(resourcePath);

            return css;
          },
        };
      });

      compilation.hooks.optimizeChunks.tap({ name: PLUGIN_NAME, stage: OPTIMIZE_CHUNKS_STAGE_ADVANCED }, () => {
        // WHAT?
        //   Performs module movements between chunks if SplitChunksPlugin is not enabled.
        // WHY?
        //   The same reason as for SplitChunksPlugin config.
        if (!compiler.options.optimization.splitChunks) {
          moveCSSModulesToGriffelChunk(compilation);
        }

        // WHAT?
        //  Disconnects Griffel chunk from other chunks, so Griffel chunk cannot be loaded async. Also connects with
        //  the main entrypoint in config.
        // WHY?
        //  This is scenario required by one of MS teams. Will be removed in the future.
        if (this.attachToMainEntryPoint) {
          const griffelChunk = compilation.namedChunks.get('griffel');

          if (typeof griffelChunk !== 'undefined') {
            griffelChunk.disconnectFromGroups();
            attachGriffelChunkToMainEntryPoint(compilation, griffelChunk);
          }
        }
      });

      // WHAT?
      //  Takes a CSS file from Griffel chunks and sorts CSS inside it.
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        assets => {
          const griffelChunk = compilation.namedChunks.get('griffel');

          if (typeof griffelChunk === 'undefined') {
            return;
          }

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
