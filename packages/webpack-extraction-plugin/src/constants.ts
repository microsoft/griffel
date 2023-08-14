import type { LoaderContext } from 'webpack';

export const PLUGIN_NAME = 'GriffelExtractPlugin';
export const GriffelCssLoaderContextKey = Symbol(`${PLUGIN_NAME}/GriffelCssLoaderContextKey`);

export interface GriffelLoaderContextSupplement {
  createCSSImport(type: 'safe' | 'unsafe', css: string): string;
  getCSSOutput(type: 'safe' | 'unsafe'): string;
}

export type SupplementedLoaderContext<Options = unknown> = LoaderContext<Options> & {
  [GriffelCssLoaderContextKey]?: GriffelLoaderContextSupplement;
};
