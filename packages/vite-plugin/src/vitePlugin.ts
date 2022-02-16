import { EvalCache, Module } from '@linaria/babel-preset';
import * as path from 'path';
import { Plugin } from 'vite';

import { transformSync, TransformResult, TransformOptions } from './transformSync';

export function vitePlugin(): Plugin {
  return {
    name: 'griffel',

    transform(code: string, id: string, options?: { ssr?: boolean }) {
      console.log(code, this.resolve);

      // We are evaluating modules in Babel plugin to resolve expressions (function calls, imported constants, etc.) in
      // makeStyles() calls, see evaluatePathsInVM.ts.

      Module._resolveFilename = (id, { filename }) => {
        //
        // Oops, "this.resolve(id, filename)" should be sync
        //

        this.resolve(id, filename).then(resolvedPath => {
          console.log('Module._resolveFilename:id', id);
          console.log('Module._resolveFilename:filename', filename);
          console.log('Module._resolveFilename:resolvedPath', resolvedPath);
          if (!resolvedPath) {
            throw new Error(`Failed to resolve module "${id}"`);
          }
        });

        return ''; // resolvedPath;
      };

      return transformSync(code, {
        filename: path.relative(process.cwd(), id),
        enableSourceMaps: false,
        inputSourceMap: undefined,
        pluginOptions: {},
      });
    },
  };
}
