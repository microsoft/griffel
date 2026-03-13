import { describe, it, expect } from 'vitest';
import transformSync, { type TransformOptions } from './transform-sync.mjs';

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
        generateMetadata: true,
      },
    };

    const result = transformSync(sourceCode, options);

    expect(result.metadata!.cssEntries).toMatchInlineSnapshot(`
      {
        "useStyles": {
          "root": [
            ".fe3e8s9{color:red;}",
            ".fcnqdeg{background-color:green;}",
            ".fvjh0tl{margin-top:4px;}",
          ],
        },
      }
    `);
    expect(result.metadata!.locations).toMatchInlineSnapshot(`
      {
        "useStyles": {
          "root": {
            "end": {
              "column": 7,
              "index": 317,
              "line": 14,
            },
            "start": {
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
        generateMetadata: true,
      },
    };

    const result = transformSync(sourceCode, options);

    expect(result.metadata!.commentDirectives).toMatchInlineSnapshot(`
      {
        "useStyles": {
          "foo": [
            [
              "griffel-csslint-disable",
              "foo",
            ],
          ],
          "root": [
            [
              "griffel-csslint-disable",
              "foo",
            ],
            [
              "griffel-csslint-disable",
              "bar",
            ],
          ],
        },
      }
    `);

    expect(result.metadata!.resetCommentDirectives).toMatchInlineSnapshot(`
      {
        "useResetStyles": [
          [
            "griffel-csslint-disable",
            "foo",
          ],
        ],
        "useResetStylesExportedLater": [
          [
            "griffel-csslint-disable",
            "foo",
          ],
          [
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
        generateMetadata: true,
      },
    };

    const result = transformSync(sourceCode, options);

    expect(result.metadata!.cssEntries).toMatchInlineSnapshot(`
      {
        "useStyles1": {
          "root": [
            ".fe3e8s9{color:red;}",
            ".fcnqdeg{background-color:green;}",
            ".fvjh0tl{margin-top:4px;}",
          ],
        },
        "useStyles2": {
          "root": [
            ".fe3e8s9{color:red;}",
            ".fcnqdeg{background-color:green;}",
            ".fvjh0tl{margin-top:4px;}",
          ],
        },
      }
    `);
    expect(result.metadata!.callExpressionLocations).toEqual({
      useStyles1: {
        start: {
          column: 32,
          index: 365,
          line: 17,
        },
        end: {
          column: 50,
          index: 383,
          line: 17,
        },
      },
      useStyles2: {
        start: {
          column: 32,
          index: 417,
          line: 18,
        },
        end: {
          column: 50,
          index: 435,
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
        generateMetadata: true,
      },
    };

    const result = transformSync(sourceCode, options);

    expect(result.metadata!.cssResetEntries).toMatchInlineSnapshot(`
      {
        "useResetStyles1": [
          ".rv6h41g{color:red;background-color:green;margin-top:4px;}",
        ],
        "useResetStyles2": [
          ".rv6h41g{color:red;background-color:green;margin-top:4px;}",
        ],
      }
    `);
    expect(result.metadata!.callExpressionLocations).toEqual({
      useResetStyles1: {
        start: {
          column: 37,
          index: 339,
          line: 12,
        },
        end: {
          column: 60,
          index: 362,
          line: 12,
        },
      },
      useResetStyles2: {
        start: {
          column: 37,
          index: 401,
          line: 13,
        },
        end: {
          column: 60,
          index: 424,
          line: 13,
        },
      },
    });
  });
});
