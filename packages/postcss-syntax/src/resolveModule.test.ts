import NativeModule from 'node:module';
import * as path from 'node:path';
import { describe, it, expect } from 'vitest';

import { nodeResolve } from './resolveModule.js';

const currentDir = import.meta.dirname;

/**
 * `@griffel/transform` passes the requiring module itself as the second argument, Node's resolver
 * relies on `id`/`filename` for relative requests and on `paths` for bare specifiers.
 */
function createParentModule(filename = path.join(currentDir, 'fixture.styles.ts')) {
  const nodeModulePaths = (NativeModule as unknown as { _nodeModulePaths: (dir: string) => string[] })._nodeModulePaths;

  return { id: filename, filename, paths: nodeModulePaths(path.dirname(filename)) };
}

function registeredExtensions() {
  return Object.keys((NativeModule as unknown as { _extensions: Record<string, unknown> })._extensions);
}

describe('nodeResolve', () => {
  it('should resolve a relative import without an extension to a TypeScript file', () => {
    expect(nodeResolve('./parse', createParentModule())).toEqual({
      path: path.join(currentDir, 'parse.ts'),
      builtin: false,
    });
  });

  it('should resolve a relative import with an explicit extension', () => {
    expect(nodeResolve('./parse.ts', createParentModule())).toEqual({
      path: path.join(currentDir, 'parse.ts'),
      builtin: false,
    });
  });

  it('should resolve a bare specifier via node_modules', () => {
    const { path: resolvedPath, builtin } = nodeResolve('postcss', createParentModule());

    expect(builtin).toBe(false);
    expect(resolvedPath).toContain(`${path.sep}node_modules${path.sep}postcss${path.sep}`);
  });

  it.each(['path', 'node:path'])('should flag %s as a Node builtin', id => {
    expect(nodeResolve(id, createParentModule())).toEqual({ path: id, builtin: true });
  });

  it('should throw when a module cannot be resolved', () => {
    expect(() => nodeResolve('./does-not-exist', createParentModule())).toThrow(
      `Cannot find module './does-not-exist'`,
    );
  });

  it('should not leave temporary extensions registered', () => {
    const before = registeredExtensions();

    nodeResolve('./parse', createParentModule());
    expect(registeredExtensions()).toEqual(before);

    expect(() => nodeResolve('./does-not-exist', createParentModule())).toThrow();
    expect(registeredExtensions()).toEqual(before);
  });
});
