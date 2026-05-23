import { EvalCache, transformSync, type TransformOptions, type TransformResult } from '@griffel/transform';
import type * as webpack from 'webpack';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GriffelCssLoaderContextKey, type SupplementedLoaderContext } from './constants.mjs';
import { generateCSSRules } from './utils/generateCSSRules.mjs';
import { resolveAssetPathsInCSSRules } from './utils/resolveAssetPaths.mjs';

export type WebpackLoaderOptions = Omit<TransformOptions, 'filename' | 'generateMetadata' | 'resolveModule'>;

type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// virtual-loader/ sits one dir above the compiled .mjs (in dist/) at the package
// root, so `npm pack` ships it via the `files` field without a build-time copy.
const virtualLoaderPath = path.resolve(__dirname, '..', 'virtual-loader', 'index.cjs');

function webpackLoader(
  this: SupplementedLoaderContext<WebpackLoaderOptions>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
) {
  this.async();
  // Loaders are cacheable by default, but in edge cases/bugs when caching does not work until it's specified:
  // https://github.com/webpack/webpack/issues/14946
  this.cacheable();

  const { classNameHashSalt, importsToTransform, functionsToTransform, evaluationRules } = this.getOptions();

  // Early return to handle cases when there is no Griffel usage in the file
  const functionNames = functionsToTransform ?? ['makeStyles', 'makeResetStyles', 'makeStaticStyles'];

  if (!functionNames.some(name => sourceCode.includes(name))) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  if (!this[GriffelCssLoaderContextKey]) {
    throw new Error('GriffelCSSExtractionPlugin is not configured, please check your webpack config');
  }

  this[GriffelCssLoaderContextKey]!.runWithTimer(() => {
    // Clear require cache to allow re-evaluation of modules
    EvalCache.clearForFile(this.resourcePath);

    let result: TransformResult | null = null;
    let error: Error | null = null;

    try {
      result = transformSync(sourceCode, {
        filename: this.resourcePath,
        resolveModule: (id, params) => {
          const resolved = this[GriffelCssLoaderContextKey]!.resolveModule(id, params);

          this.addDependency(resolved.path);

          return resolved;
        },
        classNameHashSalt,
        importsToTransform,
        functionsToTransform,
        evaluationRules,
        collectPerfIssues: this[GriffelCssLoaderContextKey]?.collectPerfIssues,
      });
    } catch (err) {
      error = err as Error;
    }

    if (result) {
      const { code, cssRulesByBucket, usedVMForEvaluation, perfIssues } = result;
      const meta = {
        filename: this.resourcePath,
        step: 'transform' as const,
        evaluationMode: usedVMForEvaluation ? ('vm' as const) : ('ast' as const),
        perfIssues,
      };

      if (cssRulesByBucket) {
        const resolvedCssRulesByBucket = resolveAssetPathsInCSSRules(cssRulesByBucket, this.resourcePath);
        const css = generateCSSRules(resolvedCssRulesByBucket);

        if (css.length === 0) {
          this.callback(null, code);

          return { result: undefined, meta };
        }

        this[GriffelCssLoaderContextKey]!.registerExtractedCss(css);

        const outputFileName = this.resourcePath.replace(/\.[^.]+$/, '.griffel.css');
        const request = `${outputFileName}!=!${virtualLoaderPath}!${this.resourcePath}`;
        const stringifiedRequest = JSON.stringify(this.utils.contextify(this.context || this.rootContext, request));

        this.callback(null, `${result.code}\n\nimport ${stringifiedRequest};`);
        return { result: undefined, meta };
      }

      this.callback(null, code);
      return { result: undefined, meta };
    }

    this.callback(error);
    return {
      result: undefined,
      meta: {
        filename: this.resourcePath,
        step: 'transform' as const,
        evaluationMode: 'vm' as const,
      },
    };
  });
}

export default webpackLoader;
