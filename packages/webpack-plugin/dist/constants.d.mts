import { LoaderContext } from 'webpack';
import { TransformResolver } from './resolver/types.mjs';
export declare const PLUGIN_NAME = "GriffelExtractPlugin";
export declare const GriffelCssLoaderContextKey: unique symbol;
export interface GriffelLoaderContextSupplement {
    resolveModule: TransformResolver;
    registerExtractedCss(css: string): void;
    getExtractedCss(): string;
    runWithTimer<T>(cb: () => {
        result: T;
        meta: {
            filename: string;
            step: 'transform';
            evaluationMode: 'ast' | 'vm';
        };
    }): T;
}
export type SupplementedLoaderContext<Options = unknown> = LoaderContext<Options> & {
    [GriffelCssLoaderContextKey]?: GriffelLoaderContextSupplement;
};
