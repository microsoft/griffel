import transformSync, { type TransformOptions } from './transform-sync';

describe('transformSync', () => {
  it('should parse TS and return metadata that contains css location', () => {
    const sourceCode = `
    import type { GriffelStyle } from '@griffel/react'
    import { makeStyles } from '@griffel/react';

    const mixin = (): GriffelStyle => ({
      marginTop: '4px',
    })

    export const useStyles = makeStyles({
      root: {
        color: 'red',
        backgroundColor: 'green',
        ...mixin()
      }
    })
    `;
    const options: TransformOptions = {
      filename: 'test.styles.ts',
      pluginOptions: {
        babelOptions: {
          presets: ['@babel/preset-typescript'],
        },
        generateMetadata: true,
      },
    };

    const result = transformSync(sourceCode, options);

    expect(result.metadata.cssEntries).toMatchInlineSnapshot(`
      Object {
        "useStyles": Object {
          "root": Array [
            ".fe3e8s9{color:red;}",
            ".fcnqdeg{background-color:green;}",
            ".fvjh0tl{margin-top:4px;}",
          ],
        },
      }
    `);
    expect(result.metadata.locations).toMatchInlineSnapshot(`
      Object {
        "useStyles": Object {
          "root": Object {
            "end": Position {
              "column": 7,
              "index": 317,
              "line": 14,
            },
            "filename": undefined,
            "identifierName": undefined,
            "start": Position {
              "column": 6,
              "index": 227,
              "line": 10,
            },
          },
        },
      }
    `);
  });

  it('should parse TS and return comment directives prefixed with griffel-', () => {
    const sourceCode = `
    import type { GriffelStyle } from '@griffel/react'
    import { makeStyles, makeResetStyles } from '@griffel/react';

    export const useStyles = makeStyles({
      // griffel-csslint-disable foo
      // griffel-csslint-disable bar
      root: {
        color: 'red',
        backgroundColor: 'green',
      },

      // griffel-csslint-disable foo
      foo: {
        color: 'blue'
      }
    })

    // griffel-csslint-disable foo
    export const useResetStyles = makeResetStyles({
      color: 'red',
    })

    // griffel-csslint-disable foo
    // griffel-csslint-disable bar
    const useResetStylesExportedLater = makeResetStyles({
      color: 'red',
    })

    export { useResetStylesExportedLater };
    `;

    const options: TransformOptions = {
      filename: 'test.styles.ts',
      pluginOptions: {
        babelOptions: {
          presets: ['@babel/preset-typescript'],
        },
        generateMetadata: true,
      },
    };

    const result = transformSync(sourceCode, options);

    expect(result.metadata.commentDirectives).toMatchInlineSnapshot(`
      Object {
        "useStyles": Object {
          "foo": Array [
            Array [
              "griffel-csslint-disable",
              "foo",
            ],
          ],
          "root": Array [
            Array [
              "griffel-csslint-disable",
              "foo",
            ],
            Array [
              "griffel-csslint-disable",
              "bar",
            ],
          ],
        },
      }
    `);

    expect(result.metadata.resetCommentDirectives).toMatchInlineSnapshot(`
      Object {
        "useResetStyles": Array [
          Array [
            "griffel-csslint-disable",
            "foo",
          ],
        ],
        "useResetStylesExportedLater": Array [
          Array [
            "griffel-csslint-disable",
            "foo",
          ],
          Array [
            "griffel-csslint-disable",
            "bar",
          ],
        ],
      }
    `);
  });

  it('should return location of makeStyles call expression', () => {
    const sourceCode = `
      import type { GriffelStyle } from "@griffel/react";
      import { makeStyles } from "@griffel/react";

      const mixin = (): GriffelStyle => ({
        marginTop: "4px",
      });

      const styles = {
        root: {
          color: "red",
          backgroundColor: "green",
          ...mixin(),
        },
      };

      export const useStyles1 = makeStyles(styles);
      export const useStyles2 = makeStyles(styles);
      `;
    const options: TransformOptions = {
      filename: 'test.styles.ts',
      pluginOptions: {
        babelOptions: {
          presets: ['@babel/preset-typescript'],
        },
        generateMetadata: true,
      },
    };

    const result = transformSync(sourceCode, options);

    expect(result.metadata.cssEntries).toMatchInlineSnapshot(`
      Object {
        "useStyles1": Object {
          "root": Array [
            ".fe3e8s9{color:red;}",
            ".fcnqdeg{background-color:green;}",
            ".fvjh0tl{margin-top:4px;}",
          ],
        },
        "useStyles2": Object {
          "root": Array [
            ".fe3e8s9{color:red;}",
            ".fcnqdeg{background-color:green;}",
            ".fvjh0tl{margin-top:4px;}",
          ],
        },
      }
    `);
    expect(result.metadata.callExpressionLocations).toEqual({
      useStyles1: {
        end: {
          column: 50,
          index: 383,
          line: 17,
        },
        start: {
          column: 32,
          index: 365,
          line: 17,
        },
      },
      useStyles2: {
        end: {
          column: 50,
          index: 435,
          line: 18,
        },
        start: {
          column: 32,
          index: 417,
          line: 18,
        },
      },
    });
  });

  it('should return location of makeResetStyles call expression', () => {
    const sourceCode = `
      import type { GriffelStyle } from "@griffel/react";
      import { makeResetStyles } from "@griffel/react";
      const mixin = (): GriffelStyle => ({
        marginTop: "4px",
      });
      const styles = {
        color: "red",
        backgroundColor: "green",
        ...mixin(),
      };
      export const useResetStyles1 = makeResetStyles(styles);
      export const useResetStyles2 = makeResetStyles(styles);
      `;
    const options: TransformOptions = {
      filename: 'test.styles.ts',
      pluginOptions: {
        babelOptions: {
          presets: ['@babel/preset-typescript'],
        },
        generateMetadata: true,
      },
    };

    const result = transformSync(sourceCode, options);

    expect(result.metadata.cssResetEntries).toMatchInlineSnapshot(`
      Object {
        "useResetStyles1": Array [
          ".rv6h41g{color:red;background-color:green;margin-top:4px;}",
        ],
        "useResetStyles2": Array [
          ".rv6h41g{color:red;background-color:green;margin-top:4px;}",
        ],
      }
    `);
    expect(result.metadata.callExpressionLocations).toEqual({
      useResetStyles1: {
        end: {
          column: 60,
          index: 362,
          line: 12,
        },
        start: {
          column: 37,
          index: 339,
          line: 12,
        },
      },
      useResetStyles2: {
        end: {
          column: 60,
          index: 424,
          line: 13,
        },
        start: {
          column: 37,
          index: 401,
          line: 13,
        },
      },
    });
  });
});
