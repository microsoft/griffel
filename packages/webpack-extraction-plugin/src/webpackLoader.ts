import { normalizeCSSBucketEntry } from '@griffel/core';
import * as path from 'path';
import type * as webpack from 'webpack';

import type { TransformResult, TransformOptions } from './transformSync';
import { transformSync } from './transformSync';
import type { SupplementedLoaderContext } from './constants';
import { GriffelCssLoaderContextKey } from './constants';

export type WebpackLoaderOptions = {
  /**
   * Please never use this feature, it will be removed without further notice.
   */
  unstable_keepOriginalCode?: boolean;
};

type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;

const virtualLoaderPath = path.resolve(__dirname, '..', 'virtual-loader', 'index.js');
const virtualCSSFilePath = path.resolve(__dirname, '..', 'virtual-loader', 'griffel.css');

/**
 * Webpack can also pass sourcemaps as a string or null, Babel accepts only objects, boolean and undefined.
 * See https://github.com/babel/babel-loader/pull/889.
 */
function parseSourceMap(inputSourceMap: WebpackLoaderParams[1]): TransformOptions['inputSourceMap'] {
  try {
    if (typeof inputSourceMap === 'string') {
      return JSON.parse(inputSourceMap) as TransformOptions['inputSourceMap'];
    }

    if (inputSourceMap === null) {
      return undefined;
    }

    return inputSourceMap as TransformOptions['inputSourceMap'];
  } catch (err) {
    return undefined;
  }
}

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

  // Early return to handle cases when __styles() calls are not present, allows skipping expensive invocation of Babel
  if (sourceCode.indexOf('__styles') === -1 && sourceCode.indexOf('__resetStyles') === -1) {
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

  const { unstable_keepOriginalCode } = this.getOptions();

  let result: TransformResult | null = null;
  let error: Error | null = null;

  try {
    result = transformSync(sourceCode, {
      filename: path.relative(process.cwd(), this.resourcePath),
      enableSourceMaps: this.sourceMap || false,
      inputSourceMap: parseSourceMap(inputSourceMap),
    });
  } catch (err) {
    error = err as Error;
  }

  if (result) {
    const resultCode = unstable_keepOriginalCode ? sourceCode : result.code;
    const resultSourceMap = unstable_keepOriginalCode ? inputSourceMap : result.sourceMap;
    const { cssRulesByBucket } = result;

    if (cssRulesByBucket) {
      const entries = Object.entries(cssRulesByBucket);

      if (entries.length === 0) {
        this.callback(null, resultCode, resultSourceMap);
        return;
      }

      const css = entries.reduce((acc, [cssBucketName, cssBucketRules]) => {
        if (cssBucketName === 'm') {
          return (
            acc +
            cssBucketRules
              .map(entry => {
                return [
                  `/** @griffel:css-start [${cssBucketName}] [${JSON.stringify(entry[1])}] **/`,
                  normalizeCSSBucketEntry(entry)[0],
                  `/** @griffel:css-end **/`,
                  '',
                ].join('\n');
              })
              .join('')
          );
        }

        return (
          acc +
          [
            `/** @griffel:css-start [${cssBucketName}] **/`,
            cssBucketRules.flatMap(entry => normalizeCSSBucketEntry(entry)).join(''),
            `/** @griffel:css-end **/`,
            '',
          ].join('\n')
        );
      }, '');

      if (IS_RSPACK) {
        const request = `griffel.css!=!${virtualLoaderPath}!${virtualCSSFilePath}?style=${toURIComponent(css)}`;
        const stringifiedRequest = JSON.stringify(this.utils.contextify(this.context || this.rootContext, request));

        this.callback(null, `${resultCode}\n\nimport ${stringifiedRequest};`, resultSourceMap);
        return;
      }

      this[GriffelCssLoaderContextKey]?.registerExtractedCss(css);

      const outputFileName = this.resourcePath.replace(/\.[^.]+$/, '.griffel.css');
      const request = `${outputFileName}!=!${virtualLoaderPath}!${this.resourcePath}`;
      const stringifiedRequest = JSON.stringify(this.utils.contextify(this.context || this.rootContext, request));

      this.callback(null, `${resultCode}\n\nimport ${stringifiedRequest};`, resultSourceMap);
      return;
    }

    this.callback(null, resultCode, resultSourceMap);
    return;
  }

  this.callback(error);
}

export default webpackLoader;
