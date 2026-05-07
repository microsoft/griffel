import { describe, it, expect } from 'vitest';
import { compile, middleware, serialize, stringify } from 'stylis';
import { sortClassesInAtRulesPlugin } from './sortClassesInAtRulesPlugin.js';
import * as prettier from 'prettier';

async function formatCss(value: string) {
  return (await prettier.format(value, { parser: 'css' })).trim();
}

function compileRule(rule: string) {
  return serialize(compile(rule), middleware([sortClassesInAtRulesPlugin, stringify]));
}

describe('sortClassesInAtRulesPlugin', () => {
  describe('at-rules', () => {
    it('handles @media', async () => {
      const css = `
        @media (min-width: 480px) {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      `;

      expect(await formatCss(compileRule(css))).toMatchInlineSnapshot(`
        "@media (min-width: 480px) {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }"
      `);
    });

    it('handles @supports', async () => {
      const css = `
        @supports (display: flex) {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      `;

      expect(await formatCss(compileRule(css))).toMatchInlineSnapshot(`
        "@supports (display: flex) {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }"
      `);
    });

    it('handles @layer', async () => {
      const css = `
        @layer utilities {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      `;

      expect(await formatCss(compileRule(css))).toMatchInlineSnapshot(`
        "@layer utilities {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }"
      `);
    });

    it('handles @container', async () => {
      const css = `
        @container utilities {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      `;

      expect(await formatCss(compileRule(css))).toMatchInlineSnapshot(`
        "@container utilities {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }"
      `);
    });
  });

  it('handles nested at-rules', async () => {
    const css = `
      @supports (display: flex) {
        @media (min-width: 480px) {
          .b { padding-right: 1px; }
          .a { padding-left: 1px; }
        }
      }
    `;

    expect(await formatCss(compileRule(css))).toMatchInlineSnapshot(`
      "@supports (display: flex) {
        @media (min-width: 480px) {
          .a {
            padding-left: 1px;
          }
          .b {
            padding-right: 1px;
          }
        }
      }"
    `);
  });

  it('handles selectors', async () => {
    const css = `
      @media (min-width: 480px) {
        .b:hover { padding-right: 1px; }
        .a:hover { padding-left: 1px; }
      }
    `;

    expect(await formatCss(compileRule(css))).toMatchInlineSnapshot(`
      "@media (min-width: 480px) {
        .a:hover {
          padding-left: 1px;
        }
        .b:hover {
          padding-right: 1px;
        }
      }"
    `);
  });
});
