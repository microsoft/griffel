import type { LoaderContext } from 'webpack';
import type { BucketStrategy } from '@griffel/core';
import type { TransformResolver, TransformPerfIssue } from '@griffel/transform';

export const PLUGIN_NAME = 'GriffelExtractPlugin';
export const GriffelCssLoaderContextKey = Symbol.for(`${PLUGIN_NAME}/GriffelCssLoaderContextKey`);

export interface GriffelLoaderContextSupplement {
  collectPerfIssues: boolean;
  /** Build-time bucket assignment strategy passed through to @griffel/transform. */
  bucketStrategy?: BucketStrategy;
  /** When true, generateCSSRules wraps each emitted block in @layer. */
  wrapInLayer?: boolean;
  resolveModule: TransformResolver;
  registerExtractedCss(css: string): void;
  getExtractedCss(): string;
  runWithTimer<T>(
    cb: () => {
      result: T;
      meta: {
        filename: string;
        step: 'transform';
        evaluationMode: 'ast' | 'vm';
        perfIssues?: TransformPerfIssue[];
      };
    },
  ): T;
}

export type SupplementedLoaderContext<Options = unknown> = LoaderContext<Options> & {
  [GriffelCssLoaderContextKey]?: GriffelLoaderContextSupplement;
};
