import { styleBucketOrdering, normalizeCSSBucketEntry, defaultCompareMediaQueries } from '@griffel/core';
import * as enhancedResolve from 'enhanced-resolve';
import * as path from 'node:path';
import { compile, COMMENT, serialize, stringify } from 'stylis';
const PLUGIN_NAME = 'GriffelExtractPlugin';
const GriffelCssLoaderContextKey = Symbol.for(`${PLUGIN_NAME}/GriffelCssLoaderContextKey`);
const RESOLVE_OPTIONS_DEFAULTS = {
  conditionNames: ['require'],
  extensions: ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json'],
};
function createEnhancedResolverFactory(resolveOptions = {}) {
  const { inheritResolveOptions = ['alias', 'modules', 'plugins'], webpackResolveOptions } = resolveOptions;
  return function (compilation) {
    const resolveOptionsFromWebpackConfig = compilation?.options.resolve ?? {};
    const resolveSync = enhancedResolve.create.sync({
      ...RESOLVE_OPTIONS_DEFAULTS,
      ...Object.fromEntries(
        inheritResolveOptions.map(resolveOptionKey => [
          resolveOptionKey,
          resolveOptionsFromWebpackConfig[resolveOptionKey],
        ]),
      ),
      ...webpackResolveOptions,
    });
    return function resolveModule(id, { filename }) {
      const resolvedPath = resolveSync(path.dirname(filename), id);
      if (!resolvedPath) {
        throw new Error(`enhanced-resolve: Failed to resolve module "${id}"`);
      }
      return resolvedPath;
    };
  };
}
function parseCSSRules(css) {
  const cssRulesByBucket = styleBucketOrdering.reduce((acc, styleBucketName) => {
    acc[styleBucketName] = [];
    return acc;
  }, {});
  const elements = compile(css);
  const unrelatedElements = [];
  let cssBucketName = null;
  let cssMeta = null;
  for (const element of elements) {
    if (element.type === COMMENT) {
      if (element.value.indexOf('/** @griffel:css-start') === 0) {
        cssBucketName = element.value.charAt(24);
        cssMeta = JSON.parse(element.value.slice(27, -4));
        continue;
      }
      if (element.value.indexOf('/** @griffel:css-end') === 0) {
        cssBucketName = null;
        cssMeta = null;
        continue;
      }
    }
    if (cssBucketName) {
      const cssRule = serialize([element], stringify);
      const bucketEntry = cssMeta ? [cssRule, cssMeta] : cssRule;
      cssRulesByBucket[cssBucketName].push(bucketEntry);
      continue;
    }
    unrelatedElements.push(element);
  }
  return { cssRulesByBucket, remainingCSS: serialize(unrelatedElements, stringify) };
}
const styleBucketOrderingMap = styleBucketOrdering.reduce((acc, cur, j) => {
  acc[cur] = j;
  return acc;
}, {});
function getUniqueRulesFromSets(setOfCSSRules) {
  const uniqueCSSRules = /* @__PURE__ */ new Map();
  for (const cssRulesByBucket of setOfCSSRules) {
    for (const _styleBucketName in cssRulesByBucket) {
      const styleBucketName = _styleBucketName;
      for (const bucketEntry of cssRulesByBucket[styleBucketName]) {
        const [cssRule, meta] = normalizeCSSBucketEntry(bucketEntry);
        const priority = meta?.['p'] ?? 0;
        const media = meta?.['m'] ?? '';
        uniqueCSSRules.set(cssRule, { styleBucketName, cssRule, priority, media });
      }
    }
  }
  return Array.from(uniqueCSSRules.values());
}
function sortCSSRules(setOfCSSRules, compareMediaQueries) {
  return getUniqueRulesFromSets(setOfCSSRules)
    .sort((entryA, entryB) => entryA.priority - entryB.priority)
    .sort(
      (entryA, entryB) =>
        styleBucketOrderingMap[entryA.styleBucketName] - styleBucketOrderingMap[entryB.styleBucketName],
    )
    .sort((entryA, entryB) => compareMediaQueries(entryA.media, entryB.media))
    .map(entry => entry.cssRule)
    .join('');
}
const OPTIMIZE_CHUNKS_STAGE_ADVANCED = 10;
function attachGriffelChunkToAnotherChunk(compilation, griffelChunk, attachToEntryPoint) {
  const entryPoints = Array.from(compilation.entrypoints.values());
  if (entryPoints.length === 0) {
    return;
  }
  const searchFn =
    typeof attachToEntryPoint === 'string' ? chunk => chunk.name === attachToEntryPoint : attachToEntryPoint;
  const mainEntryPoint = entryPoints.find(searchFn) ?? entryPoints[0];
  const targetChunk = mainEntryPoint.getEntrypointChunk();
  targetChunk.split(griffelChunk);
}
function getAssetSourceContents(assetSource) {
  const source = assetSource.source();
  if (typeof source === 'string') {
    return source;
  }
  return source.toString();
}
function isCSSModule(module) {
  return module.type === 'css/mini-extract';
}
function isGriffelCSSModule(module) {
  if (isCSSModule(module)) {
    if (Buffer.isBuffer(module.content)) {
      const content = module.content.toString('utf-8');
      return content.indexOf('/** @griffel:css-start') !== -1;
    }
  }
  return false;
}
function moveCSSModulesToGriffelChunk(compilation) {
  let griffelChunk = compilation.namedChunks.get('griffel');
  if (!griffelChunk) {
    griffelChunk = compilation.addChunk('griffel');
  }
  const matchingChunks = /* @__PURE__ */ new Set();
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
class GriffelPlugin {
  #attachToEntryPoint;
  #collectStats;
  #compareMediaQueries;
  #resolverFactory;
  #stats = {};
  constructor(options = {}) {
    this.#attachToEntryPoint = options.unstable_attachToEntryPoint;
    this.#collectStats = options.collectStats ?? false;
    this.#compareMediaQueries = options.compareMediaQueries ?? defaultCompareMediaQueries;
    this.#resolverFactory = options.resolverFactory ?? createEnhancedResolverFactory();
  }
  apply(compiler) {
    const IS_RSPACK = Object.prototype.hasOwnProperty.call(compiler.webpack, 'rspackVersion');
    const { Compilation, NormalModule } = compiler.webpack;
    if (!IS_RSPACK) {
      compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, nmf => {
        nmf.hooks.createModule.tap(
          PLUGIN_NAME,
          // @ts-expect-error CreateData is typed as 'object'...
          createData => {
            if (createData.matchResource && createData.matchResource.endsWith('.griffel.css')) {
              createData.settings.sideEffects = true;
            }
          },
        );
      });
    }
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
      if (!IS_RSPACK) {
        const cssByModuleMap = /* @__PURE__ */ new Map();
        NormalModule.getCompilationHooks(compilation).loader.tap(PLUGIN_NAME, (loaderContext, module) => {
          const resourcePath = module.resource;
          loaderContext[GriffelCssLoaderContextKey] = {
            resolveModule,
            registerExtractedCss(css) {
              cssByModuleMap.set(resourcePath, css);
            },
            getExtractedCss() {
              const css = cssByModuleMap.get(resourcePath) ?? '';
              cssByModuleMap.delete(resourcePath);
              return css;
            },
            runWithTimer: cb => {
              if (this.#collectStats) {
                const start = process.hrtime.bigint();
                const { meta, result } = cb();
                const end = process.hrtime.bigint();
                this.#stats[meta.filename] = {
                  time: end - start,
                  evaluationMode: meta.evaluationMode,
                };
                return result;
              }
              return cb().result;
            },
          };
        });
      }
      if (!compiler.options.optimization.splitChunks) {
        if (IS_RSPACK) {
          throw new Error(
            [
              `You are using Rspack, but don't have "optimization.splitChunks" enabled.`,
              '"optimization.splitChunks" should be enabled for "@griffel/webpack-extraction-plugin" to function properly.',
            ].join(' '),
          );
        }
        compilation.hooks.optimizeChunks.tap({ name: PLUGIN_NAME, stage: OPTIMIZE_CHUNKS_STAGE_ADVANCED }, () => {
          moveCSSModulesToGriffelChunk(compilation);
        });
      }
      if (this.#attachToEntryPoint) {
        if (IS_RSPACK) {
          throw new Error('You are using Rspack, "attachToMainEntryPoint" option is supported only with Webpack.');
        }
        compilation.hooks.optimizeChunks.tap({ name: PLUGIN_NAME, stage: OPTIMIZE_CHUNKS_STAGE_ADVANCED }, () => {
          const griffelChunk = compilation.namedChunks.get('griffel');
          if (typeof griffelChunk !== 'undefined') {
            griffelChunk.disconnectFromGroups();
            attachGriffelChunkToAnotherChunk(compilation, griffelChunk, this.#attachToEntryPoint);
          }
        });
      }
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        assets => {
          let cssAssetDetails;
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
        },
      );
      compilation.hooks.statsPrinter.tap(
        {
          name: PLUGIN_NAME,
        },
        () => {
          if (this.#collectStats) {
            let logTime = function (time) {
              if (time > BigInt(1e6)) {
                return (time / BigInt(1e6)).toString() + 'ms';
              }
              if (time > BigInt(1e3)) {
                return (time / BigInt(1e3)).toString() + 'μs';
              }
              return time.toString() + 'ns';
            };
            const entries = Object.entries(this.#stats).sort(([, a], [, b]) => Number(b.time - a.time));
            console.log('\nGriffel CSS extraction stats:');
            console.log('------------------------------------');
            console.log(
              'Total time spent in Griffel loader:',
              logTime(entries.reduce((acc, cur) => acc + cur[1].time, BigInt(0))),
            );
            console.log(
              'AST evaluation hit: ',
              ((entries.filter(s => s[1].evaluationMode === 'ast').length / entries.length) * 100).toFixed(2) + '%',
            );
            console.log('------------------------------------');
            for (const [filename, info] of entries) {
              console.log(`  ${logTime(info.time)} - ${filename} (evaluation mode: ${info.evaluationMode})`);
            }
            console.log();
          }
        },
      );
    });
  }
}
function createOxcResolverFactory() {
  throw new Error('oxc-resolver is not available in current environment');
}
export { GriffelPlugin, createEnhancedResolverFactory, createOxcResolverFactory };
