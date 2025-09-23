import { Module } from '@griffel/transform';
import { Compilation } from 'webpack';
export type TransformResolver = (typeof Module)['_resolveFilename'];
export type TransformResolverFactory = (compilation: Compilation) => TransformResolver;
