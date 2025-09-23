import { Configuration } from 'webpack';
import { TransformResolverFactory } from './types.mjs';
export declare function createEnhancedResolverFactory(resolveOptions?: {
    inheritResolveOptions?: ('alias' | 'modules' | 'plugins' | 'conditionNames' | 'extensions')[];
    webpackResolveOptions?: Pick<Required<Configuration>['resolve'], 'alias' | 'modules' | 'plugins' | 'conditionNames' | 'extensions'>;
}): TransformResolverFactory;
