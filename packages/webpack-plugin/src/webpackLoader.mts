import { EvalCache, Module, transformSync, type TransformOptions, type TransformResult } from '@griffel/transform';
import type * as webpack from 'webpack';
import * as path from 'node:path';

import { GriffelCssLoaderContextKey, type SupplementedLoaderContext } from './constants.mjs';
import { generateCSSRules } from './utils/generateCSSRules.mjs';

export type WebpackLoaderOptions = Omit<TransformOptions, 'filename' | 'generateMetadata'>;

type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;

const __dirname = path.dirname(new URL(import.meta.url).pathname);
// TODO: do something better, define via exports?
const virtualLoaderPath = path.resolve(__dirname, 'virtual-loader', 'index.cjs');
const virtualCSSFilePath = path.resolve(__dirname, 'virtual-loader', 'griffel.css');

function toURIComponent(rule: string): string {
  return encodeURIComponent(rule).replace(/!/g, '%21');
}

function webpackLoader(
  this: SupplementedLoaderContext<WebpackLoaderOptions>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
) {
  this.async();
  // Loaders are cacheable by default, but in edge cases/bugs when caching does not work until it's specified:
  // https://github.com/webpack/webpack/issues/14946
  this.cacheable();

  // Early return to handle cases when there is no Griffel usage in the file
  if (sourceCode.indexOf('makeStyles') === -1 && sourceCode.indexOf('makeResetStyles') === -1) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  const IS_RSPACK = !this.webpack;

  // @ Rspack compat:
  // We don't use the trick with loader context as assets are generated differently
  if (!IS_RSPACK) {
    if (!this[GriffelCssLoaderContextKey]) {
      throw new Error('GriffelCSSExtractionPlugin is not configured, please check your webpack config');
    }
  }

  const { classNameHashSalt, modules, evaluationRules, babelOptions } = this.getOptions();

  this[GriffelCssLoaderContextKey]!.runWithTimer(() => {
    // Clear require cache to allow re-evaluation of modules
    EvalCache.clearForFile(this.resourcePath);

    const originalResolveFilename = Module._resolveFilename;

    let result: TransformResult | null = null;
    let error: Error | null = null;

    try {
      // We are evaluating modules in Babel plugin to resolve expressions (function calls, imported constants, etc.) in
      // makeStyles() calls, see evaluatePathsInVM.ts.
      // Webpack's config can define own module resolution, Babel plugin should use Webpack's resolution to properly
      // resolve paths.
      Module._resolveFilename = (id, params) => {
        const resolvedPath = this[GriffelCssLoaderContextKey]!.resolveModule(id, params);

        this.addDependency(resolvedPath);

        return resolvedPath;
      };

      result = transformSync(sourceCode, {
        filename: this.resourcePath,
        classNameHashSalt,
        modules,
        evaluationRules,
        babelOptions,
      });
    } catch (err) {
      error = err as Error;
    } finally {
      // Restore original behaviour
      Module._resolveFilename = originalResolveFilename;
    }

    if (result) {
      const { code, cssRulesByBucket, usedVMForEvaluation } = result;
      const meta = {
        filename: this.resourcePath,
        step: 'transform' as const,
        evaluationMode: usedVMForEvaluation ? ('vm' as const) : ('ast' as const),
      };

      if (cssRulesByBucket) {
        const css = generateCSSRules(cssRulesByBucket);

        if (css.length === 0) {
          this.callback(null, code);

          return { result: undefined, meta };
        }

        if (IS_RSPACK) {
          const request = `griffel.css!=!${virtualLoaderPath}!${virtualCSSFilePath}?style=${toURIComponent(css)}`;
          const stringifiedRequest = JSON.stringify(this.utils.contextify(this.context || this.rootContext, request));

          this.callback(null, `${result.code}\n\nimport ${stringifiedRequest};`);
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
        evaluationMode: 'ast' as const,
      },
    };
  });
}

export default webpackLoader;