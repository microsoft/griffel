import type { Module } from '@griffel/transform';
import type { Compilation } from 'webpack';

export type TransformResolver = (typeof Module)['_resolveFilename'];
export type TransformResolverFactory = (compilation: Compilation) => TransformResolver;
