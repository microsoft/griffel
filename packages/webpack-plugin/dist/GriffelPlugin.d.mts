import { GriffelRenderer } from '@griffel/core';
import { Compilation, Compiler } from 'webpack';
import { TransformResolverFactory } from './resolver/types.mjs';
type EntryPoint = Compilation['entrypoints'] extends Map<unknown, infer I> ? I : never;
export type GriffelCSSExtractionPluginOptions = {
    collectStats?: boolean;
    compareMediaQueries?: GriffelRenderer['compareMediaQueries'];
    /** Allows to override resolver used to resolve imports inside evaluated modules. */
    resolverFactory?: TransformResolverFactory;
    /** Specifies if the CSS extracted from Griffel calls should be attached to a specific chunk with an entrypoint. */
    unstable_attachToEntryPoint?: string | ((chunk: EntryPoint) => boolean);
};
export declare class GriffelPlugin {
    #private;
    constructor(options?: GriffelCSSExtractionPluginOptions);
    apply(compiler: Compiler): void;
}
export {};
