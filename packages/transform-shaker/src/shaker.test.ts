/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/testkit/src/shaker
 *
 * Integration tests that depend on @linaria/core, @linaria/react, and linaria
 * fixtures have been omitted. Only the self-contained shake() tests are kept.
 */

import dedent from 'dedent';

import shaker from './index.js';

function getFileName() {
  return '/test/source.js';
}

function _shake(only: string[] = ['__linariaPreval']) {
  return (literal: TemplateStringsArray, ...placeholders: string[]): [string, Map<string, string[]>] => {
    const code = dedent(literal, ...placeholders);
    const [shaken, deps] = shaker(
      getFileName(),
      {
        displayName: true,
        evaluate: true,
        rules: [
          {
            action: shaker,
          },
          {
            test: /\/node_modules\//,
            action: 'ignore',
          },
        ],
      },
      code,
      only,
    );

    return [shaken, deps!];
  };
}

it('removes all', () => {
  const [shaken] = _shake()`
    const { whiteColor: color, anotherColor } = require('…');
    const a = color || anotherColor;
    color.green = '#0f0';

    exports.__linariaPreval = [];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps only code which is related to `color`', () => {
  const [shaken] = _shake()`
    const { whiteColor: color, anotherColor } = require('…');
    const wrap = '';
    const a = color || anotherColor;
    color.green = '#0f0';
    module.exports = { color, anotherColor };
    exports.__linariaPreval = [color];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps only code which is related to `anotherColor`', () => {
  const [shaken] = _shake()`
    const { whiteColor: color, anotherColor } = require('…');
    const a = color || anotherColor;
    color.green = '#0f0';
    exports.__linariaPreval = [anotherColor];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps only code which is related to `a`', () => {
  const [shaken] = _shake()`
    const { whiteColor: color, anotherColor } = require('…');
    const a = color || anotherColor;
    color.green = '#0f0';
    exports.__linariaPreval = [a];
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
    require('…');
    export default color;
    exports.__linariaPreval = [color, defaultColor];
  `;

  expect(shaken).toMatchSnapshot();
});

it('should keep member expression key', () => {
  const [shaken] = _shake()`
    const key = 'blue';
    const obj = { blue: '#00F' };
    const blue = obj[key];
    exports.__linariaPreval = [blue];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes exports', () => {
  const [shaken] = _shake()`
    import { whiteColor as color, anotherColor } from '…';
    export const a = color;
    export { redColor } from "…";
    export { anotherColor };
    exports.__linariaPreval = [a];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes es5 exports', () => {
  const [shaken] = _shake(['redColor', 'greenColor', 'yellowColor'])`
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.redColor = 'red';
    exports['yellowColor'] = 'yellow';
    exports['pinkColor'] = 'pink';
    Object.defineProperty(exports, "blueColor", {
      enumerable: true,
      get: function get() {
        return 'blue';
      }
    });
    Object.defineProperty(exports, "greenColor", {
      enumerable: true,
      get: function get() {
        return 'green';
      }
    });
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
    exports.__linariaPreval = [foo];
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

    exports.__linariaPreval = [fill1, fill2];
  `;

  expect(shaken).toMatchSnapshot();
});

it('shakes sequence expression', () => {
  const [shaken] = _shake()`
    import { external } from '…';
    const color1 = (external, () => 'blue');
    let local = '';
    const color2 = (local = color1(), () => local);
    exports.__linariaPreval = [color2];
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
    exports.__linariaPreval = [identifier, object, array, obj];
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
    exports.__linariaPreval = [obj2];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps reused exports', () => {
  const [shaken] = _shake()`
    const bar = function() {
      return 'hello world';
    };
    exports.bar = bar;

    const foo = exports.bar();
    exports.__linariaPreval = [foo];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps ESM import when binding is referenced via CJS export', () => {
  const [shaken] = _shake(['__mkPreval'])`
    import { colorBlue } from './consts';
    export const useStyles = 'unused';
    const __mkPreval = { color: colorBlue };
    module.exports = { __mkPreval };
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps ESM default import when binding is referenced via CJS export', () => {
  const [shaken] = _shake(['__mkPreval'])`
    import blank from './blank.jpg';
    const __mkPreval = { backgroundImage: blank };
    module.exports = { __mkPreval };
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
    exports.__linariaPreval = [result];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps identifiers used as spread arguments', () => {
  const [shaken] = _shake()`
    const shared = { display: 'flex' };
    const unused = { display: 'grid' };
    const styles = { ...shared, color: 'red' };
    exports.__linariaPreval = [styles];
  `;

  expect(shaken).toMatchSnapshot();
});

it('keeps identifiers used as computed property keys', () => {
  const [shaken] = _shake()`
    const selector = '& .foo';
    const unused = 'bar';
    const styles = { [selector]: { color: 'red' } };
    exports.__linariaPreval = [styles];
  `;

  expect(shaken).toMatchSnapshot();
});
