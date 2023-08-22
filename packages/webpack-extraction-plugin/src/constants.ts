import type { LoaderContext, NormalModule } from 'webpack';

export const PLUGIN_NAME = 'GriffelExtractPlugin';
export const RegisterMappingsLoaderContextKey = Symbol(`${PLUGIN_NAME}/RegisterMappingsLoaderContextKey`);
export const GriffelCssModuleKey = Symbol(`${PLUGIN_NAME}/extracted-css`);

export interface GriffelLoaderContextSupplement {
  registerExtractedCss(css: string): void;
  getExtractedCss(): string;
}

export type SupplementedLoaderCotext<Options = unknown> = LoaderContext<Options> & {
  [RegisterMappingsLoaderContextKey]?: GriffelLoaderContextSupplement;
};

export type GriffelCssModule = NormalModule & {
  [GriffelCssModuleKey]: string;
};
