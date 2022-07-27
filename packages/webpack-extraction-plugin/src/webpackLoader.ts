import { getOptions } from 'loader-utils';
import * as path from 'path';
import { validate } from 'schema-utils';
import * as webpack from 'webpack';

import { transformSync, TransformResult, TransformOptions } from './transformSync';
import { configSchema } from './schema';

type WebpackLoaderOptions = never;

type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;

const resourceDirectory = path.resolve(__dirname, '..', 'virtual-loader');

function toURIComponent(rule: string): string {
  return encodeURIComponent(rule).replace(/!/g, '%21');
}

function shouldTransformSourceCode(sourceCode: string): boolean {
  return sourceCode.indexOf('__styles') !== -1;
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
  if (!shouldTransformSourceCode(sourceCode)) {
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
    this.callback(null, result.code, result.sourceMap);
    return;
  }

  this.callback(error);
}

export default webpackLoader;
