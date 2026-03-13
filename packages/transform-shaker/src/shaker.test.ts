/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/testkit/src/shaker
 *
 * Integration tests that depend on @linaria/core, @linaria/react, and linaria
 * fixtures have been omitted. Only the self-contained shake() tests are kept.
 *
 * Tests converted to ESM-first syntax.
 */

import dedent from 'dedent';

import shaker from './index.js';

function getFileName() {
  return '/test/source.js';
}

function _shake(only: string[] = ['__linariaPreval']) {
  return (literal: TemplateStringsArray, ...placeholders: string[]): [string, Map<string, string[]>] => {
    const code = dedent(literal, ...placeholders);
    const result = shaker(getFileName(), code, only);

    return [result.code, result.imports!];
  };
}

it('removes all', () => {
  const [shaken] = _shake()`
    import { whiteColor as color, anotherColor } from '…';
    const a = color || anotherColor;
    color.green = '#0f0';

    export const __linariaPreval = [];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps only code which is related to `color`', () => {
  const [shaken] = _shake()`
    import { whiteColor as color, anotherColor } from '…';
    const wrap = '';
    const a = color || anotherColor;
    color.green = '#0f0';
    export { color, anotherColor };
    export const __linariaPreval = [color];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps only code which is related to `anotherColor`', () => {
  const [shaken] = _shake()`
    import { whiteColor as color, anotherColor } from '…';
    const a = color || anotherColor;
    color.green = '#0f0';
    export const __linariaPreval = [anotherColor];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps only code which is related to `a`', () => {
  const [shaken] = _shake()`
    import { whiteColor as color, anotherColor } from '…';
    const a = color || anotherColor;
    color.green = '#0f0';
    export const __linariaPreval = [a];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes imports', () => {
  const [shaken] = _shake()`
    import { unrelatedImport } from '…';
    import { whiteColor as color, anotherColor } from '…';
    import defaultColor from '…';
    import anotherDefaultColor from '…';
    import '…';
    export default color;
    export const __linariaPreval = [color, defaultColor];
  `;

  expect(shaken).toMatchSnapshot();
});

it('should keep member expression key', () => {
  const [shaken] = _shake()`
    const key = 'blue';
    const obj = { blue: '#00F' };
    const blue = obj[key];
    export const __linariaPreval = [blue];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes exports', () => {
  const [shaken] = _shake()`
    import { whiteColor as color, anotherColor } from '…';
    export const a = color;
    export { redColor } from "…";
    export { anotherColor };
    export const __linariaPreval = [a];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes es5 exports', () => {
  const [shaken] = _shake(['redColor', 'greenColor', 'yellowColor'])`
    export const redColor = 'red';
    export const yellowColor = 'yellow';
    export const pinkColor = 'pink';
    export const blueColor = (() => 'blue')();
    export const greenColor = (() => 'green')();
  `;

  expect(shaken).toMatchSnapshot();
});

// TODO: this test will be disabled until the shaker is fully implemented
it.skip('should throw away any side effects', () => {
  const [shaken] = _shake()`
    const objects = { key: { fontSize: 12 } };
    const foo = (k) => {
      const obj = objects[k];
      console.log('side effect');
      return obj;
    };
    export const __linariaPreval = [foo];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps objects as is', () => {
  const [shaken] = _shake()`
    const fill1 = (top = 0, left = 0, right = 0, bottom = 0) => ({
      position: 'absolute',
      top,
      right,
      bottom,
      left,
    });

    const fill2 = (top = 0, left = 0, right = 0, bottom = 0) => {
      return {
        position: 'absolute',
        top,
        right,
        bottom,
        left,
      };
    };

    export const __linariaPreval = [fill1, fill2];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes sequence expression', () => {
  const [shaken] = _shake()`
    import { external } from '…';
    const color1 = (external, () => 'blue');
    let local = '';
    const color2 = (local = color1(), () => local);
    export const __linariaPreval = [color2];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes assignment patterns', () => {
  const [shaken] = _shake()`
    const [identifier = 1] = [2];
    const [{...object} = {}] = [{ a: 1, b: 2 }];
    const [[...array] = []] = [[1,2,3,4]];
    const obj = { member: null };
    ([obj.member = 42] = [1]);
    export const __linariaPreval = [identifier, object, array, obj];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes for-in statements', () => {
  const [shaken] = _shake()`
    const obj1 = { a: 1, b: 2 };
    const obj2 = {};
    for (const key in obj1) {
      obj2[key] = obj1[key];
    }
    export const __linariaPreval = [obj2];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps reused exports', () => {
  const [shaken] = _shake()`
    export const bar = function() {
      return 'hello world';
    };

    const foo = bar();
    export const __linariaPreval = [foo];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps ESM import with batch export', () => {
  const [shaken] = _shake(['__mkPreval'])`
    import { colorBlue } from './consts';
    export const useStyles = 'unused';
    export const __mkPreval = { color: colorBlue };
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps ESM default import with batch export', () => {
  const [shaken] = _shake(['__mkPreval'])`
    import blank from './blank.jpg';
    export const __mkPreval = { backgroundImage: blank };
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps export const declarators', () => {
  const [shaken] = _shake(['colorBlue'])`
    export const colorBlue = 'blue';
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps multiple export const declarators', () => {
  const [shaken] = _shake(['className', 'selector'])`
    export const className = 'component-foo';
    export const selector = '& .component-bar';
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps identifiers inside template literals', () => {
  const [shaken] = _shake()`
    const color = 'red';
    const unused = 'blue';
    const result = \`color is \${color}\`;
    export const __linariaPreval = [result];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps identifiers used as spread arguments', () => {
  const [shaken] = _shake()`
    const shared = { display: 'flex' };
    const unused = { display: 'grid' };
    const styles = { ...shared, color: 'red' };
    export const __linariaPreval = [styles];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps class with constructor references to imports and sibling exports', () => {
  const [shaken] = _shake(['config'])`
    import { baseHeight } from './base';
    import { unused } from './unused';
    import { labels } from './labels';

    export const defaults = {
        transparent: 'transparent'
    };

    export class Config {
        constructor(){
            this.height = baseHeight;
            this.color = labels.highlight;
            this.fallback = defaults.transparent;
        }
    }

    export const config = new Config();
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps only referenced re-exports from barrel files', () => {
  const [shaken] = _shake(['colorBlue', 'colorGreen'])`
    export { sizeSmall, sizeLarge } from './sizes';
    export { colorRed, colorBlue, colorGreen, colorYellow } from './colors';
    export { fontBold } from './fonts';
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps export-all re-exports when referenced export is not found locally', () => {
  const [shaken] = _shake(['colorBlue'])`
    export { sizeSmall } from './sizes';
    export * from './colors';
    export { fontBold } from './fonts';
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes export-all when requested export is found as named re-export', () => {
  const [shaken] = _shake(['baz'])`
    export * from './foo';
    export { baz } from './baz';
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps all export-all re-exports when requested export is not found locally', () => {
  const [shaken] = _shake(['qux'])`
    export * from './foo';
    export * from './baz';
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps local export specifiers (export { name })', () => {
  const [shaken] = _shake(['shorthands'])`
    import { border } from './shorthands/border';
    import { margin } from './shorthands/margin';
    export { createDOMRenderer } from './renderer/createDOMRenderer';
    export { mergeClasses } from './mergeClasses';

    const shorthands = {
      border,
      margin,
    };

    export { shorthands };
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps for-of loop right-hand side reference', () => {
  const [shaken] = _shake(['fn'])`
    export function fn(obj) {
      const result = {};
      const keys = Object.keys(obj);
      for (const key of keys) {
        result[key] = obj[key];
      }
      return result;
    }
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps identifiers used as computed property keys', () => {
  const [shaken] = _shake()`
    const selector = '& .foo';
    const unused = 'bar';
    const styles = { [selector]: { color: 'red' } };
    export const __linariaPreval = [styles];
  `;

  expect(shaken).toMatchSnapshot();
});

it('removes `export * as ns` if not requested', () => {
  const [shaken] = _shake(['unknownExport'])`
    export * as ns from './module';
    export * from './other';
  `;

  expect(shaken).toMatchSnapshot();
});

it('does not break export * as ns when requesting the namespace export', () => {
  const [shaken] = _shake(['ns'])`
    export * as ns from './module';
  `;

  expect(shaken).toMatchSnapshot();
});

it('preserves catch clause parameter when unused', () => {
  const [shaken] = _shake()`
    function fn() {
      try { throw new Error('test'); }
      catch (e) { /* unused */ }
    }
    export const __linariaPreval = [fn];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps export default identifier referencing a function declaration', () => {
  const [shaken] = _shake(['default'])`
    function isPlainObject(value) {
      return typeof value === 'object';
    }
    export default isPlainObject;
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps IIFE enum initializer when export is requested', () => {
  const [shaken] = _shake(['ThemeName'])`
    export var ThemeName;
    (function (ThemeName) {
        ThemeName[ThemeName["Light"] = 0] = "Light";
        ThemeName[ThemeName["Dark"] = 1] = "Dark";
    })(ThemeName || (ThemeName = {}));
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes unrelated IIFE enums in the same file', () => {
  const [shaken] = _shake(['ThemeName'])`
    export var ActionStyle;
    (function (ActionStyle) {
        ActionStyle["Default"] = "default";
        ActionStyle["Positive"] = "positive";
    })(ActionStyle || (ActionStyle = {}));
    export var ThemeName;
    (function (ThemeName) {
        ThemeName[ThemeName["Light"] = 0] = "Light";
        ThemeName[ThemeName["Dark"] = 1] = "Dark";
    })(ThemeName || (ThemeName = {}));
  `;

  expect(shaken).toMatchSnapshot();
});

it('preserves labeled statement label', () => {
  const [shaken] = _shake()`
    function fn() {
      var result = [];
      outer:
      while (true) {
        result.push(1);
        break outer;
      }
      return result;
    }
    export const __linariaPreval = [fn];
  `;

  expect(shaken).toMatchSnapshot();
});
