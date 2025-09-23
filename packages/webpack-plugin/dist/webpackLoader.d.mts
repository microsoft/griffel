import { TransformOptions } from '@griffel/transform';
import { SupplementedLoaderContext } from './constants.mjs';
import type * as webpack from 'webpack';
export type WebpackLoaderOptions = Omit<TransformOptions, 'filename' | 'generateMetadata'>;
type WebpackLoaderParams = Parameters<webpack.LoaderDefinitionFunction<WebpackLoaderOptions>>;
declare function webpackLoader(this: SupplementedLoaderContext<WebpackLoaderOptions>, sourceCode: WebpackLoaderParams[0], inputSourceMap: WebpackLoaderParams[1]): void;
export default webpackLoader;
