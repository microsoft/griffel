import type { ModuleResolver } from '@griffel/transform';
import type { Compilation } from 'webpack';

export type TransformResolver = ModuleResolver;
export type TransformResolverFactory = (compilation: Compilation) => TransformResolver;
