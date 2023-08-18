import type { LoaderContext } from 'webpack';

export const PLUGIN_NAME = 'GriffelExtractPlugin';
export const RegisterMappingsLoaderContextKey = Symbol(`${PLUGIN_NAME}/RegisterMappingsLoaderContextKey`);

export interface GriffelLoaderContextSupplement {
  (cssRuleToPropertyHashMap?: Record<string, string>, ltrToRtlClassMap?: Record<string, string>): void;
  minify: boolean;
}

export type SupplementedLoaderCotext<Options = unknown> = LoaderContext<Options> & {
  [RegisterMappingsLoaderContextKey]?: GriffelLoaderContextSupplement;
};
