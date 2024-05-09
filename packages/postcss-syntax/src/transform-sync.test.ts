import transformSync, { TransformOptions } from './transform-sync';

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
});
