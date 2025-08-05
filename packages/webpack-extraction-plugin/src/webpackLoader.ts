import * as path from 'path';
import type * as webpack from 'webpack';

import type { TransformResult, TransformOptions } from './transformSync';
import { transformSync } from './transformSync';
import type { SupplementedLoaderContext } from './constants';
import { GriffelCssLoaderContextKey } from './constants';
import { generateCSSRules } from './generateCSSRules';
import { configSchema } from './schema';

export type WebpackLoaderOptions = {
  /**
   * Salt to use for class names hashing.
   *
   * This loader will not perform any hashing, it will just perform validation to ensure that all processed files
   * use the same salt.
   */
  classNameHashSalt?: string;

  /**
   * Please never use this feature, it will be removed without further notice.
   */
  unstable_keepOriginalCode?: boolean;
};

type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;

const virtualLoaderPath = path.resolve(__dirname, '..', 'virtual-loader', 'index.js');
const virtualCSSFilePath = path.resolve(__dirname, '..', 'virtual-loader', 'griffel.css');

const SALT_SEARCH_STRING = '/*@griffel:classNameHashSalt "';
const SALT_SEARCH_STRING_LENGTH = SALT_SEARCH_STRING.length;

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

export function validateHashSalt(sourceCode: string, classNameHashSalt: string) {
  const commentStartLoc = sourceCode.indexOf(SALT_SEARCH_STRING);

  if (commentStartLoc === -1) {
    throw new Error(
      `GriffelCSSExtractionPlugin: classNameHashSalt is set to "${classNameHashSalt}", but no salt location comment was found in the source code.`,
    );
  }

  const saltStartLoc = commentStartLoc + SALT_SEARCH_STRING_LENGTH;
  const saltEndLoc = sourceCode.indexOf('"*/', saltStartLoc);

  const saltFromComment = sourceCode.slice(commentStartLoc + SALT_SEARCH_STRING_LENGTH, saltEndLoc);

  if (saltFromComment !== classNameHashSalt) {
    throw new Error(
      `GriffelCSSExtractionPlugin: classNameHashSalt is set to "${classNameHashSalt}", but the salt location comment contains "${saltFromComment}". Please ensure that all files use the same salt.`,
    );
  }
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

  const { classNameHashSalt = '', unstable_keepOriginalCode } = this.getOptions(configSchema);

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
      const css = generateCSSRules(cssRulesByBucket);

      if (css.length === 0) {
        this.callback(null, resultCode, resultSourceMap);
        return;
      }

      // Heads up!
      // Run validation only if any CSS rules were generated, otherwise it might be a false positive
      if (classNameHashSalt.length > 0) {
        validateHashSalt(sourceCode, classNameHashSalt);
      }

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
