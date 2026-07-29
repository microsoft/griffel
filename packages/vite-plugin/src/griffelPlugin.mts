import { defaultCompareMediaQueries, type CSSRulesByBucket, type GriffelRenderer } from '@griffel/core';
import { EvalCache, transformSync, type TransformOptions } from '@griffel/transform';
import { createFilter, type FilterPattern, type Plugin, type ResolvedConfig, type Rollup } from 'vite';

import {
  createStatsCollector,
  generateCSSRules,
  parseCSSRules,
  resolveAssetPathsInCSSRules,
  sortCSSRules,
  CSS_START_MARKER,
} from '@griffel/css-extraction-utils';

import { GRIFFEL_CSS_SUFFIX, PLUGIN_NAME } from './constants.mjs';
import { createResolverFactory, type TransformResolverFactory } from './resolver/createResolverFactory.mjs';

type OutputBundle = Rollup.OutputBundle;

const DEFAULT_INCLUDE = /\.[cm]?[jt]sx?$/;
const DEFAULT_FUNCTIONS_TO_TRANSFORM = ['makeStyles', 'makeResetStyles', 'makeStaticStyles'] as const;

export type GriffelPluginOptions = Omit<TransformOptions, 'filename' | 'generateMetadata' | 'resolveModule'> & {
  /**
   * Files to process, follows the Rollup/Vite filter convention.
   * @default /\.[cm]?[jt]sx?$/
   */
  include?: FilterPattern;

  /**
   * Files to skip, follows the Rollup/Vite filter convention. Nothing is excluded by default as dependencies in
   * "node_modules" may also use Griffel.
   */
  exclude?: FilterPattern;

  /** Prints the time spent on transforms once a build is finished. */
  collectStats?: boolean;

  /** Prints dependencies that slow down evaluation (CJS modules, "export *" barrels) once a build is finished. */
  collectPerfIssues?: boolean;

  compareMediaQueries?: GriffelRenderer['compareMediaQueries'];

  /**
   * A custom comparator that orders "@container" query conditions, mirroring `compareMediaQueries`.
   * Defaults to the `compareMediaQueries` comparator.
   */
  compareContainerQueries?: GriffelRenderer['compareContainerQueries'];

  /** Allows to override resolver used to resolve imports inside evaluated modules. */
  resolverFactory?: TransformResolverFactory;
};

function getAssetSourceContents(source: string | Uint8Array): string {
  if (typeof source === 'string') {
    return source;
  }

  return Buffer.from(source).toString('utf-8');
}

/** Splits a module id into a path and a query (`?direct`, `?t=` & others are appended by Vite). */
function splitQuery(id: string): [path: string, query: string] {
  const queryIndex = id.indexOf('?');

  if (queryIndex === -1) {
    return [id, ''];
  }

  return [id.slice(0, queryIndex), id.slice(queryIndex)];
}

/**
 * A module cannot be transformed if it does not use ESM syntax. This is a common case for dependencies in
 * "node_modules" that are shipped as CommonJS, they are handled by Vite itself and should not fail a build.
 */
function isNonESMError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('is not an ES module');
}

/**
 * Picks assets that the sorted Griffel CSS should be written to.
 *
 * Every entry chunk gets the CSS of the chunk itself as the first item of "importedCss" (it's registered in
 * "renderChunk" by Vite, while the CSS of imported chunks is appended later in "generateBundle"). Writing to it
 * guarantees that Griffel CSS is loaded eagerly with an entry, exactly like a dedicated "griffel" chunk does in
 * "@griffel/webpack-plugin".
 */
function resolveEntryCSSAssets(bundle: OutputBundle): Set<string> {
  const entryAssets = new Set<string>();

  for (const output of Object.values(bundle)) {
    if (output.type !== 'chunk' || !output.isEntry) {
      continue;
    }

    const ownCSSAsset = output.viteMetadata?.importedCss.values().next().value;

    if (typeof ownCSSAsset === 'string') {
      entryAssets.add(ownCSSAsset);
    }
  }

  return entryAssets;
}

/**
 * Returns names of all CSS assets, assets of entrypoints go first to keep the CSS of an application before the CSS
 * of lazy loaded chunks. Rules with an equal priority are ordered by their appearance.
 */
function resolveCSSAssetsOrder(bundle: OutputBundle, entryAssets: Set<string>): string[] {
  const restAssets: string[] = [];

  for (const [fileName, output] of Object.entries(bundle)) {
    if (output.type !== 'asset' || !fileName.endsWith('.css') || entryAssets.has(fileName)) {
      continue;
    }

    restAssets.push(fileName);
  }

  return [...entryAssets, ...restAssets];
}

export function griffel(options: GriffelPluginOptions = {}): Plugin[] {
  const {
    include = DEFAULT_INCLUDE,
    exclude,

    collectStats = false,
    collectPerfIssues = false,

    compareMediaQueries = defaultCompareMediaQueries,
    compareContainerQueries = compareMediaQueries,

    resolverFactory = createResolverFactory(),

    ...transformOptions
  } = options;

  const filter = createFilter(include, exclude);
  const functionsToTransform = transformOptions.functionsToTransform ?? DEFAULT_FUNCTIONS_TO_TRANSFORM;

  const stats = createStatsCollector({
    collectStats,
    collectPerfIssues,
    transformLabel: 'Transform',
    extractionLabel: 'Extraction',
  });

  /** Maps a virtual CSS module id to the source file that produced it. */
  const cssModuleOwners = new Map<string, string>();
  /** Maps a source file to the CSS rules extracted from it, asset paths are not resolved yet. */
  const cssRulesByFile = new Map<string, CSSRulesByBucket>();

  let resolveModule: TransformOptions['resolveModule'];

  /** Returns `null` when a file should not be modified. */
  function runTransform(
    sourceCode: string,
    filename: string,
    addWatchFile: (watchedFile: string) => void = () => undefined,
  ): { code: string; cssRulesByBucket?: CSSRulesByBucket } | null {
    if (!filter(filename)) {
      return null;
    }

    // Early return to handle cases when there is no Griffel usage in the file
    if (!functionsToTransform.some(functionName => sourceCode.includes(functionName))) {
      return null;
    }

    // Clear require cache to allow re-evaluation of modules
    EvalCache.clearForFile(filename);

    const startTime = stats.now();

    try {
      const result = transformSync(sourceCode, {
        ...transformOptions,

        filename,
        collectPerfIssues,
        resolveModule: (moduleId, params) => {
          const resolved = resolveModule!(moduleId, params);

          addWatchFile(resolved.path);

          return resolved;
        },
      });

      stats.register(filename, startTime, {
        evaluationMode: result.usedVMForEvaluation ? 'vm' : 'ast',
        perfIssues: result.perfIssues,
      });

      return result;
    } catch (error) {
      if (isNonESMError(error)) {
        return null;
      }

      throw error;
    }
  }

  const transformPlugin: Plugin = {
    name: `${PLUGIN_NAME}:transform`,
    // Runs before "vite:esbuild" & framework plugins to receive the original source code, this matches the loader
    // order in Webpack where the Griffel loader is the last one in a chain
    enforce: 'pre',
    apply: 'build',

    configResolved(config: ResolvedConfig) {
      const alias = Array.isArray(config.resolve?.alias) ? undefined : config.resolve?.alias;

      resolveModule = resolverFactory({ alias });
    },

    buildStart() {
      cssModuleOwners.clear();
      cssRulesByFile.clear();
      stats.clear();
    },

    resolveId(source) {
      const [cleanSource, query] = splitQuery(source);

      if (cssModuleOwners.has(cleanSource)) {
        return cleanSource + query;
      }

      return null;
    },

    load(id) {
      const [cleanId] = splitQuery(id);
      const sourceFilename = cssModuleOwners.get(cleanId);

      if (typeof sourceFilename === 'undefined') {
        return null;
      }

      const cssRules = cssRulesByFile.get(sourceFilename);

      if (typeof cssRules === 'undefined') {
        return '';
      }

      // Asset paths are resolved relatively to the virtual CSS module, it's placed next to the source file so that
      // "url()" references keep working
      return generateCSSRules(resolveAssetPathsInCSSRules(cssRules, cleanId));
    },

    transform(sourceCode, id) {
      const [filename] = splitQuery(id);

      if (id.includes('\0')) {
        return null;
      }

      const result = runTransform(sourceCode, filename, watchedFile => this.addWatchFile(watchedFile));

      if (result === null) {
        return null;
      }

      if (!result.cssRulesByBucket) {
        cssRulesByFile.delete(filename);
        return { code: result.code, map: null };
      }

      cssRulesByFile.set(filename, result.cssRulesByBucket);

      const cssModuleId = filename.replace(/\.[^.]+$/, GRIFFEL_CSS_SUFFIX);

      cssModuleOwners.set(cssModuleId, filename);

      return { code: `${result.code}\n\nimport ${JSON.stringify(cssModuleId)};`, map: null };
    },
  };

  const extractPlugin: Plugin = {
    name: `${PLUGIN_NAME}:extract`,
    // Runs after "vite:css-post" that produces CSS assets, a plugin with "enforce: post" is the only way to observe
    // and modify them
    enforce: 'post',
    apply: 'build',

    generateBundle(_outputOptions, bundle) {
      const startTime = stats.now();

      const entryAssets = resolveEntryCSSAssets(bundle);

      const cssRules: CSSRulesByBucket[] = [];
      const assetsWithGriffelCSS: string[] = [];

      for (const fileName of resolveCSSAssetsOrder(bundle, entryAssets)) {
        const output = bundle[fileName];

        if (output?.type !== 'asset') {
          continue;
        }

        const assetContents = getAssetSourceContents(output.source);

        if (!assetContents.includes(CSS_START_MARKER)) {
          continue;
        }

        const { cssRulesByBucket, remainingCSS } = parseCSSRules(assetContents);

        cssRules.push(cssRulesByBucket);
        assetsWithGriffelCSS.push(fileName);

        output.source = remainingCSS;
      }

      if (cssRules.length === 0) {
        return;
      }

      // WHAT?
      //   Merges the CSS of all chunks into assets of entrypoints & sorts it.
      // WHY?
      //   CSS rules should be sorted in the same order as it's done via style buckets by the Griffel runtime, it's
      //   not possible to do it in multiple assets as they can be loaded in an arbitrary order.
      const sortedCSS = sortCSSRules(cssRules, compareMediaQueries, compareContainerQueries);

      // Library & SSR builds may have no entry chunks with CSS attached, in this case the CSS stays where it was found
      const targetAssets = entryAssets.size > 0 ? entryAssets : new Set([assetsWithGriffelCSS[0]]);

      for (const fileName of targetAssets) {
        const output = bundle[fileName];

        if (output?.type !== 'asset') {
          continue;
        }

        output.source = getAssetSourceContents(output.source) + sortedCSS;
      }

      stats.registerExtraction(startTime);
    },

    closeBundle() {
      stats.print();
    },
  };

  return [transformPlugin, extractPlugin];
}
