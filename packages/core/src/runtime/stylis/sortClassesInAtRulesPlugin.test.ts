import { compile, middleware, serialize, stringify } from 'stylis';
import { sortClassesInAtRulesPlugin } from './sortClassesInAtRulesPlugin';
import * as prettier from 'prettier';

const cssFormatSerializer: jest.SnapshotSerializerPlugin = {
  test(value) {
    return typeof value === 'string';
  },
  print(value) {
    /**
     * test function makes sure that value is the guarded type
     */
    const _value = value as string;

    return prettier.format(_value, { parser: 'css' }).trim();
  },
};

function compileRule(rule: string) {
  return serialize(compile(rule), middleware([sortClassesInAtRulesPlugin, stringify]));
}

expect.addSnapshotSerializer(cssFormatSerializer);

describe('sortClassesInAtRulesPlugin', () => {
  describe('at-rules', () => {
    it('handles @media', () => {
      const css = `
        @media (min-width: 480px) {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      `;

      expect(compileRule(css)).toMatchInlineSnapshot(`
        @media (min-width: 480px) {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }
      `);
    });

    it('handles @supports', () => {
      const css = `
        @supports (display: flex) {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      `;

      expect(compileRule(css)).toMatchInlineSnapshot(`
        @supports (display: flex) {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }
      `);
    });

    it('handles @layer', () => {
      const css = `
        @layer utilities {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      `;

      expect(compileRule(css)).toMatchInlineSnapshot(`
        @layer utilities {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }
      `);
    });

    it('handles @container', () => {
      const css = `
        @container utilities {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      `;

      expect(compileRule(css)).toMatchInlineSnapshot(`
        @container utilities {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }
      `);
    });
  });

  it('handles nested at-rules', () => {
    const css = `
      @supports (display: flex) {
        @media (min-width: 480px) {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      }
    `;

    expect(compileRule(css)).toMatchInlineSnapshot(`
      @supports (display: flex) {
        @media (min-width: 480px) {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }
      }
    `);
  });

  it('handles selectors', () => {
    const css = `
      @media (min-width: 480px) {
        .b:hover { padding-right: 1px; }
        .a:hover { padding-left: 1px; }
      }
    `;

    expect(compileRule(css)).toMatchInlineSnapshot(`
      @media (min-width: 480px) {
        .a:hover {
          padding-left: 1px;
        }
        .b:hover {
          padding-right: 1px;
        }
      }
    `);
  });
});
