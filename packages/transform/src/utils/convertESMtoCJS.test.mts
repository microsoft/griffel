import { describe, expect, it } from 'vitest';
import { convertESMtoCJS } from './convertESMtoCJS.mjs';

describe('convertESMtoCJS', () => {
  it('throws on parse errors', () => {
    expect(() => convertESMtoCJS('for (const key of ) {}', '/test.js')).toThrowError(
      /convertESMtoCJS: failed to parse/,
    );
  });

  it('returns CJS code unchanged', () => {
    const code = 'const x = require("foo");\nmodule.exports = x;';
    expect(convertESMtoCJS(code, '/test.js')).toBe(code);
  });

  it('converts side-effect import', () => {
    expect(convertESMtoCJS('import "./foo";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      require("./foo");"
    `);
  });

  it('converts named import', () => {
    expect(convertESMtoCJS('import { foo } from "./foo";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      const { foo } = require("./foo");"
    `);
  });

  it('converts aliased named import', () => {
    expect(convertESMtoCJS('import { foo as bar } from "./foo";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      const { foo: bar } = require("./foo");"
    `);
  });

  it('converts default import', () => {
    expect(convertESMtoCJS('import foo from "./foo";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      const _require$foo = require("./foo");
      const foo = _require$foo.__esModule ? _require$foo.default : _require$foo;"
    `);
  });

  it('converts namespace import', () => {
    expect(convertESMtoCJS('import * as foo from "./foo";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      const foo = require("./foo");"
    `);
  });

  it('converts default + named imports', () => {
    expect(convertESMtoCJS('import foo, { bar } from "./foo";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      const _require$foo = require("./foo");
      const foo = _require$foo.__esModule ? _require$foo.default : _require$foo;
      const { bar } = _require$foo;"
    `);
  });

  it('converts export const', () => {
    expect(convertESMtoCJS('export const x = 1;', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      const x = 1;
      exports.x = x;"
    `);
  });

  it('converts export const with destructuring', () => {
    expect(convertESMtoCJS('export const { a, b } = obj;', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      const { a, b } = obj;
      exports.a = a; exports.b = b;"
    `);
  });

  it('converts export function', () => {
    expect(convertESMtoCJS('export function foo() {}', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      function foo() {}
      exports.foo = foo;"
    `);
  });

  it('converts export { name }', () => {
    expect(convertESMtoCJS('const x = 1;\nexport { x };', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      const x = 1;
      exports["x"] = x;"
    `);
  });

  it('converts re-export from another module', () => {
    expect(convertESMtoCJS('export { foo } from "./bar";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      exports["foo"] = require("./bar")["foo"];"
    `);
  });

  it('converts export default expression', () => {
    expect(convertESMtoCJS('export default 42;', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      exports.default = 42;"
    `);
  });

  it('converts export default named function', () => {
    expect(convertESMtoCJS('export default function foo() {}', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      function foo() {}
      exports.default = foo;"
    `);
  });

  it('converts export * from', () => {
    expect(convertESMtoCJS('export * from "./foo";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      Object.assign(exports, require("./foo"));"
    `);
  });

  it('converts export * as name from', () => {
    expect(convertESMtoCJS('export * as ns from "./foo";', '/test.js')).toMatchInlineSnapshot(`
      "Object.defineProperty(exports, "__esModule", { value: true });
      exports["ns"] = require("./foo");"
    `);
  });
});
