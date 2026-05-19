import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
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

const SALT_SEARCH_STRING = '/*@griffel:classNameHashSalt "';
const SALT_SEARCH_STRING_LENGTH = SALT_SEARCH_STRING.length;

// File-based transport for Griffel-extracted CSS on rspack. Writes the CSS to a content-hashed tempfile and
// references it via `?file=<encoded path>` on the loader request. Replaces the prior `?style=<url-encoded css>`
// inline transport, which produced loader request strings that exceeded the Linux PATH_MAX limit (4096 bytes)
// for large `.styles.ts` files and broke BuildXL pip access tracking on Linux CI.
//
// The tempfile is content-addressed (sha1 of CSS payload) so identical CSS from two loader invocations resolves
// to the same path. Writes go through a staging file + atomic rename to avoid partial reads under concurrent
// loader invocations.
const griffelCssTmpDir = path.join(os.tmpdir(), 'griffel-css-cache');

function writeCssToTempFile(css: string): string {
  if (!fs.existsSync(griffelCssTmpDir)) {
    fs.mkdirSync(griffelCssTmpDir, { recursive: true });
  }

  const hash = crypto.createHash('sha1').update(css).digest('hex');
  const tmpFile = path.join(griffelCssTmpDir, `${hash}.css`);

  if (!fs.existsSync(tmpFile)) {
    const stagingFile = `${tmpFile}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(stagingFile, css);
    try {
      fs.renameSync(stagingFile, tmpFile);
    } catch {
      try {
        fs.unlinkSync(stagingFile);
      } catch {
        /* ignore */
      }
    }
  }

  return tmpFile;
}

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
  } catch {
    return undefined;
  }
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
  if (
    sourceCode.indexOf('__styles') === -1 &&
    sourceCode.indexOf('__resetStyles') === -1 &&
    sourceCode.indexOf('__staticStyles') === -1
  ) {
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
        // Use the source file as the loader-request resource (instead of `virtual-loader/griffel.css`) so that
        // css-loader resolves `url()` references relative to the source file's directory rather than to
        // `node_modules/@griffel/webpack-extraction-plugin/virtual-loader/`. The virtual loader reads the actual
        // CSS payload from the file at `?file=<encoded path>` in the query string — keeping the loader
        // request length bounded and avoiding the Linux PATH_MAX (4096-byte) limit that the previous inline
        // `?style=<url-encoded css>` transport hit on BuildXL CI for large `.styles.ts` files.
        const outputFileName = this.resourcePath.replace(/\.[^.]+$/, '.griffel.css');
        const tmpFile = writeCssToTempFile(css);
        const request = `${outputFileName}!=!${virtualLoaderPath}!${this.resourcePath}?file=${encodeURIComponent(
          tmpFile,
        )}`;
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
