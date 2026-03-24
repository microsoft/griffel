import { defaultCompareMediaQueries, type GriffelRenderer } from '@griffel/core';
import type { Compilation, Chunk, Compiler, Module, sources } from 'webpack';

import * as path from 'node:path';

import { PLUGIN_NAME, GriffelCssLoaderContextKey, type SupplementedLoaderContext } from './constants.mjs';
import { createResolverFactory, type TransformResolverFactory } from './resolver/createResolverFactory.mjs';
import { parseCSSRules } from './utils/parseCSSRules.mjs';
import { sortCSSRules } from './utils/sortCSSRules.mjs';

// Webpack does not export these constants
// https://github.com/webpack/webpack/blob/b67626c7b4ffed8737d195b27c8cea1e68d58134/lib/OptimizationStages.js#L8
const OPTIMIZE_CHUNKS_STAGE_ADVANCED = 10;

type EntryPoint = Compilation['entrypoints'] extends Map<unknown, infer I> ? I : never;

export type GriffelCSSExtractionPluginOptions = {
  collectStats?: boolean;
  collectPerfIssues?: boolean;

  compareMediaQueries?: GriffelRenderer['compareMediaQueries'];

  /** Allows to override resolver used to resolve imports inside evaluated modules. */
  resolverFactory?: TransformResolverFactory;

  /** Specifies if the CSS extracted from Griffel calls should be attached to a specific chunk with an entrypoint. */
  unstable_attachToEntryPoint?: string | ((chunk: EntryPoint) => boolean);
};

function attachGriffelChunkToAnotherChunk(
  compilation: Compilation,
  griffelChunk: Chunk,
  attachToEntryPoint: string | ((chunk: EntryPoint) => boolean),
) {
  const entryPoints = Array.from(compilation.entrypoints.values());

  if (entryPoints.length === 0) {
    return;
  }

  const searchFn =
    typeof attachToEntryPoint === 'string'
      ? (chunk: EntryPoint) => chunk.name === attachToEntryPoint
      : attachToEntryPoint;
  const mainEntryPoint = entryPoints.find(searchFn) ?? entryPoints[0];
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

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const virtualLoaderPath = path.resolve(__dirname, 'virtual-loader', 'index.cjs');

function isGriffelCSSModule(module: Module): boolean {
  return module.type === 'css/mini-extract' && module.identifier().includes(virtualLoaderPath);
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

export class GriffelPlugin {
  readonly #attachToEntryPoint: GriffelCSSExtractionPluginOptions['unstable_attachToEntryPoint'];
  readonly #collectStats: boolean;
  readonly #collectPerfIssues: boolean;
  readonly #compareMediaQueries: NonNullable<GriffelCSSExtractionPluginOptions['compareMediaQueries']>;
  readonly #resolverFactory: TransformResolverFactory;
  readonly #stats: Record<
    string,
    {
      time: bigint;
      evaluationMode: 'ast' | 'vm';
    }
  > = {};
  #processAssetsTime: bigint = 0n;
  readonly #perfIssues: Map<string, { type: 'cjs-module' | 'barrel-export-star'; dependencyFilename: string; sourceFilenames: Set<string> }> = new Map();

  constructor(options: GriffelCSSExtractionPluginOptions = {}) {
    this.#attachToEntryPoint = options.unstable_attachToEntryPoint;
    this.#collectStats = options.collectStats ?? false;
    this.#collectPerfIssues = options.collectPerfIssues ?? false;
    this.#compareMediaQueries = options.compareMediaQueries ?? defaultCompareMediaQueries;
    this.#resolverFactory = options.resolverFactory ?? createResolverFactory();
  }

  apply(compiler: Compiler): void {
    const IS_RSPACK = Object.prototype.hasOwnProperty.call(compiler.webpack, 'rspackVersion');
    const { Compilation, NormalModule } = compiler.webpack;

    // WHAT?
    //   Prevents ".griffel.css" files from being tree shaken by forcing "sideEffects" setting.
    // WHY?
    //   The extraction loader adds `import ""` statements that trigger virtual loader. Modules created by this loader
    //   will have paths relative to source file. To identify what files have side effects Webpack relies on
    //   "sideEffects" field in "package.json" and NPM packages usually have "sideEffects: false" that will trigger
    //   Webpack to shake out generated CSS.

    // @ Rspack compat:
    // "createModule" in "normalModuleFactory" is not supported by Rspack
    // https://github.com/web-infra-dev/rspack/blob/e52601e059fff1f0cdc4e9328746fb3ae6c3ecb2/packages/rspack/src/NormalModuleFactory.ts#L53
    if (!IS_RSPACK) {
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
    }

    // WHAT?
    //  Forces all modules emitted by an extraction loader to be moved in a single chunk by SplitChunksPlugin config.
    // WHY?
    //  We need to sort CSS rules in the same order as it's done via style buckets. It's not possible in multiple
    //  chunks.
    if (compiler.options.optimization.splitChunks) {
      compiler.options.optimization.splitChunks.cacheGroups ??= {};
      compiler.options.optimization.splitChunks.cacheGroups['griffel'] = {
        name: 'griffel',
        // @ Rspack compat:
        // Rspack does not support functions in test due performance concerns
        // https://github.com/web-infra-dev/rspack/issues/3425#issuecomment-1577890202
        test: IS_RSPACK ? /griffel\.css/ : isGriffelCSSModule,
        chunks: 'all',
        enforce: true,
      };
    }

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      const resolveModule = this.#resolverFactory(compilation);

      // @ Rspack compat
      // As Rspack does not support functions in "splitChunks.cacheGroups" we have to emit modules differently
      // and can't rely on this approach due
      if (!IS_RSPACK) {
        // WHAT?
        //   Adds a callback to the loader context
        // WHY?
        //   Allows us to register the CSS extracted from Griffel calls to then process in a CSS module
        const cssByModuleMap = new Map<string, string>();

        NormalModule.getCompilationHooks(compilation).loader.tap(PLUGIN_NAME, (loaderContext, module) => {
          const resourcePath = module.resource;

          (loaderContext as SupplementedLoaderContext)[GriffelCssLoaderContextKey] = {
            collectPerfIssues: this.#collectPerfIssues,
            resolveModule,
            registerExtractedCss(css: string) {
              cssByModuleMap.set(resourcePath, css);
            },
            getExtractedCss() {
              const css = cssByModuleMap.get(resourcePath) ?? '';
              cssByModuleMap.delete(resourcePath);

              return css;
            },
            runWithTimer: cb => {
              if (!this.#collectStats && !this.#collectPerfIssues) {
                return cb().result;
              }

              const start = this.#collectStats ? process.hrtime.bigint() : 0n;
              const { meta, result } = cb();

              if (this.#collectStats) {
                const end = process.hrtime.bigint();

                this.#stats[meta.filename] = {
                  time: end - start,
                  evaluationMode: meta.evaluationMode,
                };
              }

              if (this.#collectPerfIssues && meta.perfIssues) {
                for (const issue of meta.perfIssues) {
                  const key = `${issue.type}:${issue.dependencyFilename}`;
                  const existing = this.#perfIssues.get(key);

                  if (existing) {
                    existing.sourceFilenames.add(meta.filename);
                  } else {
                    this.#perfIssues.set(key, {
                      type: issue.type,
                      dependencyFilename: issue.dependencyFilename,
                      sourceFilenames: new Set([meta.filename]),
                    });
                  }
                }
              }

              return result;
            },
          };
        });
      }

      // WHAT?
      //   Performs module movements between chunks if SplitChunksPlugin is not enabled.
      // WHY?
      //   The same reason as for SplitChunksPlugin config.
      if (!compiler.options.optimization.splitChunks) {
        // @ Rspack compat
        // Rspack does not support adding chunks in the same as Webpack, we force usage of "optimization.splitChunks"
        if (IS_RSPACK) {
          throw new Error(
            [
              'You are using Rspack, but don\'t have "optimization.splitChunks" enabled.',
              '"optimization.splitChunks" should be enabled for "@griffel/webpack-extraction-plugin" to function properly.',
            ].join(' '),
          );
        }

        compilation.hooks.optimizeChunks.tap({ name: PLUGIN_NAME, stage: OPTIMIZE_CHUNKS_STAGE_ADVANCED }, () => {
          moveCSSModulesToGriffelChunk(compilation);
        });
      }

      // WHAT?
      //  Disconnects Griffel chunk from other chunks, so Griffel chunk cannot be loaded async. Also connects with
      //  the specified chunk.
      // WHY?
      //  This is scenario required by one of MS teams. Will be removed in the future.
      if (this.#attachToEntryPoint) {
        // @ Rspack compat
        // We don't support this scenario for Rspack yet.
        if (IS_RSPACK) {
          throw new Error('You are using Rspack, "attachToMainEntryPoint" option is supported only with Webpack.');
        }

        compilation.hooks.optimizeChunks.tap({ name: PLUGIN_NAME, stage: OPTIMIZE_CHUNKS_STAGE_ADVANCED }, () => {
          const griffelChunk = compilation.namedChunks.get('griffel');

          if (typeof griffelChunk !== 'undefined') {
            griffelChunk.disconnectFromGroups();
            attachGriffelChunkToAnotherChunk(compilation, griffelChunk, this.#attachToEntryPoint!);
          }
        });
      }

      // WHAT?
      //  Takes a CSS file from Griffel chunks and sorts CSS inside it.
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        assets => {
          const start = this.#collectStats ? process.hrtime.bigint() : 0n;

          let cssAssetDetails;

          // @ Rspack compat
          // "compilation.namedChunks.get()" explodes with Rspack
          if (IS_RSPACK) {
            cssAssetDetails = Object.entries(assets).find(
              ([assetName]) => assetName.endsWith('.css') && assetName.includes('griffel'),
            );
          } else {
            const griffelChunk = compilation.namedChunks.get('griffel');

            if (typeof griffelChunk === 'undefined') {
              return;
            }

            cssAssetDetails = Object.entries(assets).find(([assetName]) => griffelChunk.files.has(assetName));
          }

          if (typeof cssAssetDetails === 'undefined') {
            return;
          }

          const [cssAssetName, cssAssetSource] = cssAssetDetails;

          const cssContent = getAssetSourceContents(cssAssetSource);
          const { cssRulesByBucket, remainingCSS } = parseCSSRules(cssContent);

          const cssSource = sortCSSRules([cssRulesByBucket], this.#compareMediaQueries);

          compilation.updateAsset(cssAssetName, new compiler.webpack.sources.RawSource(remainingCSS + cssSource));

          if (this.#collectStats) {
            this.#processAssetsTime = process.hrtime.bigint() - start;
          }
        },
      );

      compilation.hooks.statsPrinter.tap(
        {
          name: PLUGIN_NAME,
        },
        () => {
          if (this.#collectStats) {
            function logTime(time: bigint): string {
              if (time > 1_000_000n) {
                return (time / 1_000_000n).toString() + 'ms';
              }

              if (time > 1_000n) {
                return (time / 1_000n).toString() + 'μs';
              }

              return time.toString() + 'ns';
            }

            const entries = Object.entries(this.#stats).sort(([, a], [, b]) => Number(b.time - a.time));
            const totalTime = entries.reduce((acc, cur) => acc + cur[1].time, 0n);
            const fileCount = entries.length;
            const avgTime = fileCount > 0 ? totalTime / BigInt(fileCount) : 0n;

            const astEntries = entries.filter(s => s[1].evaluationMode === 'ast');
            const vmEntries = entries.filter(s => s[1].evaluationMode === 'vm');
            const astTime = astEntries.reduce((acc, cur) => acc + cur[1].time, 0n);
            const vmTime = vmEntries.reduce((acc, cur) => acc + cur[1].time, 0n);
            const astHitPct = ((astEntries.length / fileCount) * 100).toFixed(1) + '%';

            console.log(`\n[Griffel] ${fileCount} files processed`);
            console.log(`[Griffel] Loader: ${logTime(totalTime)} (AST ${logTime(astTime)} | VM ${logTime(vmTime)}), avg ${logTime(avgTime)}/file, AST eval hit ${astHitPct}`);
            console.log(`[Griffel] Plugin: ${logTime(this.#processAssetsTime)}`);
            console.log('');

            for (const [filename, info] of entries) {
              console.log(`  ${logTime(info.time)} ${info.evaluationMode === 'vm' ? 'vm ' : 'ast'} ${filename}`);
            }

            console.log();
          }

          if (this.#collectPerfIssues && this.#perfIssues.size > 0) {
            const issues = Array.from(this.#perfIssues.values());
            const cjsCount = issues.filter(i => i.type === 'cjs-module').length;
            const barrelCount = issues.filter(i => i.type === 'barrel-export-star').length;

            console.log('\nGriffel performance issues:');
            console.log('------------------------------------');
            console.log(`CJS modules (no tree-shaking): ${cjsCount}`);
            console.log(`Barrel files with remaining export *: ${barrelCount}`);
            console.log('------------------------------------');

            for (const issue of issues) {
              const tag = issue.type === 'cjs-module' ? 'cjs' : 'barrel';
              const sources = Array.from(issue.sourceFilenames).join(', ');
              console.log(`  [${tag}] ${issue.dependencyFilename} (source: ${sources})`);
            }

            console.log();
          }
        },
      );
    });
  }
}
