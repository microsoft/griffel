import type { LoaderContext } from 'webpack';
import type { TransformResolver } from './resolver/types.mjs';

export const PLUGIN_NAME = 'GriffelExtractPlugin';
export const GriffelCssLoaderContextKey = Symbol.for(`${PLUGIN_NAME}/GriffelCssLoaderContextKey`);

export interface GriffelLoaderContextSupplement {
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
      };
    },
  ): T;
}

export type SupplementedLoaderContext<Options = unknown> = LoaderContext<Options> & {
  [GriffelCssLoaderContextKey]?: GriffelLoaderContextSupplement;
};
