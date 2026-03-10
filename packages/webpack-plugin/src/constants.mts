import type { LoaderContext } from 'webpack';
import type { TransformPerfIssue } from '@griffel/transform';
import type { TransformResolver } from './resolver/types.mjs';

export const PLUGIN_NAME = 'GriffelExtractPlugin';
export const GriffelCssLoaderContextKey = Symbol.for(`${PLUGIN_NAME}/GriffelCssLoaderContextKey`);

export interface GriffelLoaderContextSupplement {
  collectPerfIssues: boolean;
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
