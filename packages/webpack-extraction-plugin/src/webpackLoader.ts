import { normalizeCSSBucketEntry } from '@griffel/core';
import { getOptions } from 'loader-utils';
import * as path from 'path';
import { validate } from 'schema-utils';
import * as webpack from 'webpack';

import { transformSync, TransformResult, TransformOptions } from './transformSync';
import { configSchema } from './schema';

type WebpackLoaderOptions = never;

type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;

const resourceDirectory = path.resolve(__dirname, '..', 'virtual-loader');

const virtualLoaderPath = path.resolve(resourceDirectory, 'index.js');
const resourcePath = path.resolve(resourceDirectory, 'griffel.css');

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
  this: webpack.LoaderContext<never>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
) {
  this.async();
  // Loaders are cacheable by default, but in edge cases/bugs when caching does not work until it's specified:
  // https://github.com/webpack/webpack/issues/14946
  this.cacheable();

  const options = getOptions(this) as WebpackLoaderOptions;

  validate(configSchema, options, {
    name: '@griffel/webpack-extraction-plugin/loader',
    baseDataPath: 'options',
  });

  // Early return to handle cases when __styles() calls are not present, allows skipping expensive invocation of Babel
  if (sourceCode.indexOf('__styles') === -1 && sourceCode.indexOf('__resetStyles') === -1) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  let result: TransformResult | null = null;
  let error: Error | null = null;

  try {
    result = transformSync(sourceCode, {
      filename: path.relative(process.cwd(), this.resourcePath),
      resourceDirectory,

      enableSourceMaps: this.sourceMap || false,
      inputSourceMap: parseSourceMap(inputSourceMap),
    });
  } catch (err) {
    error = err as Error;
  }

  if (result) {
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

      const request = `import ${JSON.stringify(
        this.utils.contextify(
          this.context || this.rootContext,
          `griffel.css!=!${virtualLoaderPath}!${resourcePath}?style=${toURIComponent(css)}`,
        ),
      )};`;

      this.callback(null, `${result.code}\n\n${request};`, result.sourceMap);
      return;
    }

    this.callback(null, result.code, result.sourceMap);
    return;
  }

  this.callback(error);
}

export default webpackLoader;
