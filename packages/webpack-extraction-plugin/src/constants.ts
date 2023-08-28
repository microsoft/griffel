import type { LoaderContext } from 'webpack';

export const PLUGIN_NAME = 'GriffelExtractPlugin';
export const GriffelCssLoaderContextKey = Symbol(`${PLUGIN_NAME}/GriffelCssLoaderContextKey`);

export interface GriffelLoaderContextSupplement {
  registerExtractedCss(css: string): void;
  getExtractedCss(): string;
}

export type SupplementedLoaderContext<Options = unknown> = LoaderContext<Options> & {
  [GriffelCssLoaderContextKey]?: GriffelLoaderContextSupplement;
};
