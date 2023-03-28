import { normalizeCSSBucketEntry } from '@griffel/core';
import * as path from 'path';
import * as webpack from 'webpack';

import { transformSync, TransformResult, TransformOptions } from './transformSync';

export type WebpackLoaderOptions = {
  /**
   * Please never use this feature, it will be removed without further notice.
   */
  unstable_keepOriginalCode?: boolean;
};

type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;

const virtualLoaderPath = path.resolve(__dirname, '..', 'virtual-loader', 'index.js');

function toURIComponent(rule: string): string {
  return encodeURIComponent(rule).replace(/!/g, '%21');
}

/**
 * Webpack can also pass sourcemaps as a string, Babel accepts only objects.
 * See https://github.com/babel/babel-loader/pull/889.
 */
function parseSourceMap(inputSourceMap: WebpackLoaderParams[1]): TransformOptions['inputSourceMap'] {
  try {
    if (typeof inputSourceMap === 'string') {
      return JSON.parse(inputSourceMap) as TransformOptions['inputSourceMap'];
    }

    return inputSourceMap as TransformOptions['inputSourceMap'];
  } catch (err) {
    return undefined;
  }
}

function webpackLoader(
  this: webpack.LoaderContext<WebpackLoaderOptions>,
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

    if (result.cssRulesByBucket) {
      const css = Object.entries(result.cssRulesByBucket).reduce((acc, [cssBucketName, cssBucketRules]) => {
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

      const outputFileName = this.resourcePath.replace(/\.[^.]+$/, '.griffel.css');

      const request = `${outputFileName}!=!${virtualLoaderPath}?style=${toURIComponent(css)}!${this.resourcePath}`;
      const stringifiedRequest = JSON.stringify(this.utils.contextify(this.context || this.rootContext, request));

      this.callback(
        null,
        // Heads up!
        // This is probably a bug, but "import" does not work properly there: files from node_modules are processed, but
        // they will not be present in chunks 😳
        `${resultCode}\n\nrequire(${stringifiedRequest});`,
        resultSourceMap,
      );
      return;
    }

    this.callback(null, resultCode, resultSourceMap);
    return;
  }

  this.callback(error);
}

export default webpackLoader;
