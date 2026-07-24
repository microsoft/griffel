import * as fs from 'node:fs';
import NativeModule from 'node:module';
import * as path from 'node:path';
import { format } from 'prettier';
import { describe, it, expect, vi } from 'vitest';

import { ASSET_TAG_OPEN, ASSET_TAG_CLOSE } from './constants.mjs';
import type { TransformResolver } from './evaluation/module.mjs';
import { transformSync, type TransformOptions } from './transformSync.mjs';

const EXTRA_EXTENSIONS = ['.ts', '.tsx', '.jsx', '.cjs'];

const nodeResolve: TransformResolver = (id, opts) => {
  const extensions = (NativeModule as unknown as { _extensions: Record<string, () => void> })._extensions;
  const added: string[] = [];

  try {
    for (const ext of EXTRA_EXTENSIONS) {
      if (!(ext in extensions)) {
        extensions[ext] = () => {};
        added.push(ext);
      }
    }

    return {
      path: (
        NativeModule as unknown as { _resolveFilename: (id: string, options: unknown) => string }
      )._resolveFilename(id, opts),
      builtin: false,
    };
  } finally {
    for (const ext of added) {
      delete extensions[ext];
    }
  }
};

type TestCase = {
  title: string;
  fixture: string;

  error?: RegExp;
  outputFixture?: string;

  only?: boolean;
  transformOptions?: Omit<TransformOptions, 'filename' | 'resolveModule'>;

  setup?: () => (() => void) | void;
};

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);
const fixturesDir = path.join(__dirname, '..', '__fixtures__');

/**
 * Asset paths in `<griffel-asset>` tags contain machine-specific absolute paths which also
 * cause class name hashes to differ. This normalizes both outputs by replacing absolute
 * paths with relative ones and hashes with ordered placeholders.
 *
 * Only applied when the meta output contains asset tags; other fixtures pass through unchanged.
 */
function normalizeAssetOutputs(code: string, meta: string, fixtureDir: string): { code: string; meta: string } {
  if (meta.indexOf(ASSET_TAG_OPEN) === -1) {
    return { code, meta };
  }

  // 1. Replace absolute paths inside asset tags with fixture-relative paths
  let normalizedMeta = '';
  let searchFrom = 0;

  while (searchFrom < meta.length) {
    const openIdx = meta.indexOf(ASSET_TAG_OPEN, searchFrom);

    if (openIdx === -1) {
      normalizedMeta += meta.slice(searchFrom);
      break;
    }

    normalizedMeta += meta.slice(searchFrom, openIdx + ASSET_TAG_OPEN.length);

    const contentStart = openIdx + ASSET_TAG_OPEN.length;
    const closeIdx = meta.indexOf(ASSET_TAG_CLOSE, contentStart);

    if (closeIdx === -1) {
      normalizedMeta += meta.slice(contentStart);
      break;
    }

    normalizedMeta += path.relative(fixtureDir, meta.slice(contentStart, closeIdx));
    searchFrom = closeIdx;
  }

  // 2. Collect unique class-name hashes from meta (e.g. ".fwvq0l6{" or ".r1abc23:")
  const hashRegex = /\.([fr][a-z0-9]{4,})(?=[{:])/g;
  const hashes: string[] = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = hashRegex.exec(normalizedMeta)) !== null) {
    if (!hashes.includes(match[1])) {
      hashes.push(match[1]);
    }
  }

  // 3. Replace hashes with deterministic ordered placeholders in both outputs
  let normalizedCode = code;

  for (let i = 0; i < hashes.length; i++) {
    const placeholder = `${hashes[i][0]}___${i}`;

    normalizedMeta = normalizedMeta.split(hashes[i]).join(placeholder);
    normalizedCode = normalizedCode.split(hashes[i]).join(placeholder);
  }

  return { code: normalizedCode, meta: normalizedMeta };
}

const TESTS: TestCase[] = [
  // 🎩 Tip: use "only: true" to run a single test
  // https://github.com/babel-utils/babel-plugin-tester#only
  //

  // Fixtures
  //
  //
  {
    title: 'at rules',
    fixture: path.resolve(fixturesDir, 'at-rules', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'at-rules', 'output.ts'),
  },
  {
    title: 'multiple declarations',
    fixture: path.resolve(fixturesDir, 'multiple-declarations', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'multiple-declarations', 'output.ts'),
  },
  {
    title: 'call of non existing module',
    fixture: path.resolve(fixturesDir, 'non-existing-module-call', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'non-existing-module-call', 'output.ts'),
  },
  {
    title: 'syntax: animationName',
    fixture: path.resolve(fixturesDir, 'keyframes', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'keyframes', 'output.ts'),
  },
  {
    title: 'syntax: CSS shorthands',
    fixture: path.resolve(fixturesDir, 'object-shorthands', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-shorthands', 'output.ts'),
  },
  {
    title: 'syntax: reset (null values)',
    fixture: path.resolve(fixturesDir, 'object-reset', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-reset', 'output.ts'),
  },

  // Assets
  //
  //
  {
    title: 'assets: import handling',
    fixture: path.resolve(fixturesDir, 'assets', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'assets', 'output.ts'),
  },
  {
    title: 'assets: multiple url()',
    fixture: path.resolve(fixturesDir, 'assets-multiple-declarations', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'assets-multiple-declarations', 'output.ts'),
  },
  {
    title: 'assets: url() without imports',
    fixture: path.resolve(fixturesDir, 'assets-urls', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'assets-urls', 'output.ts'),
  },

  // Evaluation
  //
  //
  {
    title: 'evaluation: mixins via functions',
    fixture: path.resolve(fixturesDir, 'function-mixin', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'function-mixin', 'output.ts'),
  },
  {
    title: 'evaluation: object',
    fixture: path.resolve(fixturesDir, 'object', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object', 'output.ts'),
  },
  {
    title: 'evaluation: object with computed keys',
    fixture: path.resolve(fixturesDir, 'object-computed-keys', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-computed-keys', 'output.ts'),
  },
  {
    title: 'evaluation: object with imported keys',
    fixture: path.resolve(fixturesDir, 'object-imported-keys', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-imported-keys', 'output.ts'),
  },
  {
    title: 'evaluation: object with mixins',
    fixture: path.resolve(fixturesDir, 'object-mixins', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-mixins', 'output.ts'),
  },
  {
    title: 'evaluation: nested objects',
    fixture: path.resolve(fixturesDir, 'object-nesting', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-nesting', 'output.ts'),
  },
  {
    title: 'evaluation: objects with sequence expression',
    fixture: path.resolve(fixturesDir, 'object-sequence-expr', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-sequence-expr', 'output.ts'),
  },
  {
    title: 'evaluation: objects with variables',
    fixture: path.resolve(fixturesDir, 'object-variables', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-variables', 'output.ts'),
  },
  {
    title: 'evaluation: rules with metadata',
    fixture: path.resolve(fixturesDir, 'rules-with-metadata', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'rules-with-metadata', 'output.ts'),
  },
  {
    title: 'evaluation: shared mixins',
    fixture: path.resolve(fixturesDir, 'shared-mixins', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'shared-mixins', 'output.ts'),
  },
  {
    title: 'evaluation: tokens scenario',
    fixture: path.resolve(fixturesDir, 'tokens', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'tokens', 'output.ts'),
  },
  // Configs
  //
  //
  {
    title: 'config: classNameHashSalt',
    fixture: path.resolve(fixturesDir, 'config-classname-hash-salt', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'config-classname-hash-salt', 'output.ts'),
    transformOptions: {
      classNameHashSalt: 'prefix',
    },
  },
  {
    title: 'config: evaluationRules',
    fixture: path.resolve(fixturesDir, 'config-evaluation-rules', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'config-evaluation-rules', 'output.ts'),
    transformOptions: {
      evaluationRules: [
        { action: require(path.resolve(fixturesDir, 'config-evaluation-rules', 'sampleEvaluator.cjs')).default },
      ],
    },
  },

  // Reset styles
  //
  //
  {
    title: 'reset: default',
    fixture: path.resolve(fixturesDir, 'reset-styles', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'reset-styles', 'output.ts'),
  },
  {
    title: 'reset: assets',
    fixture: path.resolve(fixturesDir, 'assets-reset-styles', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'assets-reset-styles', 'output.ts'),
  },
  {
    title: 'reset: at rules',
    fixture: path.resolve(fixturesDir, 'reset-styles-at-rules', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'reset-styles-at-rules', 'output.ts'),
  },

  // Static styles
  //
  //
  {
    title: 'static: object',
    fixture: path.resolve(fixturesDir, 'static-styles', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'static-styles', 'output.ts'),
  },
  {
    title: 'static: string',
    fixture: path.resolve(fixturesDir, 'static-styles-string', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'static-styles-string', 'output.ts'),
  },
  {
    title: 'static: array',
    fixture: path.resolve(fixturesDir, 'static-styles-array', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'static-styles-array', 'output.ts'),
  },

  // Imports
  //

  {
    title: 'imports: alias usage',
    fixture: path.resolve(fixturesDir, 'import-alias', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'import-alias', 'output.ts'),
  },
  {
    title: 'imports: custom module',
    fixture: path.resolve(fixturesDir, 'import-custom-module', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'import-custom-module', 'output.ts'),
    transformOptions: {
      importsToTransform: ['custom-package'],
    },
  },

  {
    title: 'errors: throws on CJS',
    fixture: path.resolve(fixturesDir, 'error-cjs', 'fixture.js'),
    error: /is not an ES module/,
  },

  // Exports
  //

  {
    title: 'exports: handles default export',
    fixture: path.resolve(fixturesDir, 'export-default', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'export-default', 'output.ts'),
  },

  // Errors
  //
  //

  {
    title: 'errors: unsupported shorthand CSS properties',
    fixture: path.resolve(fixturesDir, 'unsupported-css-properties', 'fixture.ts'),
    outputFixture: path.resolve(fixturesDir, 'unsupported-css-properties', 'output.ts'),
    setup() {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Suppress console errors during test
      });

      return function teardown() {
        consoleSpy.mockRestore();
      };
    },
  },
  {
    title: 'errors: throws on invalid argument count',
    fixture: path.resolve(fixturesDir, 'error-argument-count', 'fixture.js'),
    error: /function accepts only a single param/,
  },
  {
    title: 'errors: throws on undefined',
    fixture: path.resolve(fixturesDir, 'error-on-undefined', 'fixture.ts'),
    error: /Cannot read properties of undefined/,
  },
];

describe('transformSync', () => {
  it('astEvaluationPlugins: fluentTokensPlugin is enabled by default', () => {
    const sourceCode = `
import { makeStyles } from '@griffel/react';

const tokens = { colorBrandBackground: 'var(--colorBrandBackground)' };

export const useStyles = makeStyles({
  root: {
    color: tokens.colorBrandBackground,
    margin: \`\${tokens.spacingVerticalS} 0\`,
    display: 'flex',
  },
});
`;

    const result = transformSync(sourceCode, {
      filename: 'test-plugins.ts',
      resolveModule: nodeResolve,
    });

    expect(result.usedProcessing).toBe(true);
    // fluentTokensPlugin is on by default — tokens are evaluated statically, no VM needed
    expect(result.usedVMForEvaluation).toBe(false);
    expect(result.code).toContain('__css');
  });

  for (const testCase of TESTS) {
    const testFn = testCase.only ? it.only : it;

    testFn(testCase.title, async () => {
      const sourceCode = fs.readFileSync(testCase.fixture, { encoding: 'utf-8' });
      const teardown = testCase.setup?.();

      const transformOptions = testCase.transformOptions || {};

      if (testCase.error) {
        expect(() =>
          transformSync(sourceCode, {
            filename: testCase.fixture,
            resolveModule: nodeResolve,
            ...transformOptions,
          }),
        ).toThrow(testCase.error);
        return;
      }

      const { code, cssRulesByBucket, usedProcessing, usedVMForEvaluation } = transformSync(sourceCode, {
        filename: testCase.fixture,
        resolveModule: nodeResolve,
        ...transformOptions,
      });
      const outputCode = await format(code, { ...prettierConfig, parser: 'typescript' });
      const outputMeta = await format(
        JSON.stringify({ usedProcessing, usedVMForEvaluation, cssRulesByBucket }, null, 2),
        {
          ...prettierConfig,
          parser: 'json',
        },
      );

      const fixtureDir = path.dirname(testCase.fixture);
      const normalized = normalizeAssetOutputs(outputCode, outputMeta, fixtureDir);

      await expect(normalized.code).toMatchFileSnapshot(testCase.outputFixture!);
      await expect(normalized.meta).toMatchFileSnapshot(testCase.outputFixture!.replace(/\.ts$/, '.meta.json'));

      if (typeof teardown === 'function') {
        teardown?.();
      }
    });
  }
});

describe('transformSync: metadata', () => {
  const transformWithMetadata = (sourceCode: string, filename = 'metadata.styles.ts') =>
    transformSync(sourceCode, { filename, resolveModule: nodeResolve, generateMetadata: true });

  it('does not return metadata unless "generateMetadata" is enabled', () => {
    const sourceCode = `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({ root: { color: 'red' } });
`;

    const result = transformSync(sourceCode, { filename: 'metadata.styles.ts', resolveModule: nodeResolve });

    expect(result.metadata).toBeUndefined();
  });

  it('returns CSS entries and slot locations for makeStyles', () => {
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

    const result = transformWithMetadata(sourceCode, 'test.styles.ts');

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

  it('returns the call expression location for each makeStyles declarator', () => {
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

    const result = transformWithMetadata(sourceCode, 'test.styles.ts');

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
    expect(result.metadata!.callExpressionLocations).toMatchInlineSnapshot(`
      {
        "useStyles1": {
          "end": {
            "column": 50,
            "index": 383,
            "line": 17,
          },
          "start": {
            "column": 32,
            "index": 365,
            "line": 17,
          },
        },
        "useStyles2": {
          "end": {
            "column": 50,
            "index": 435,
            "line": 18,
          },
          "start": {
            "column": 32,
            "index": 417,
            "line": 18,
          },
        },
      }
    `);
  });

  it('returns CSS reset entries, reset location and call location for makeResetStyles', () => {
    const sourceCode = `
      import { makeResetStyles } from "@griffel/react";

      export const useResetStyles1 = makeResetStyles({
        color: "red",
        backgroundColor: "green",
      });
      export const useResetStyles2 = makeResetStyles({
        color: "blue",
      });
      `;

    const result = transformWithMetadata(sourceCode, 'test.styles.ts');

    expect(result.metadata!.cssResetEntries).toMatchInlineSnapshot(`
      {
        "useResetStyles1": [
          ".rbe9p1m{color:red;background-color:green;}",
        ],
        "useResetStyles2": [
          ".r14ksm7b{color:blue;}",
        ],
      }
    `);
    expect(result.metadata!.resetLocations).toMatchInlineSnapshot(`
      {
        "useResetStyles1": {
          "end": {
            "column": 7,
            "index": 176,
            "line": 7,
          },
          "start": {
            "column": 53,
            "index": 111,
            "line": 4,
          },
        },
        "useResetStyles2": {
          "end": {
            "column": 7,
            "index": 264,
            "line": 10,
          },
          "start": {
            "column": 53,
            "index": 232,
            "line": 8,
          },
        },
      }
    `);
    expect(result.metadata!.callExpressionLocations).toMatchInlineSnapshot(`
      {
        "useResetStyles1": {
          "end": {
            "column": 8,
            "index": 177,
            "line": 7,
          },
          "start": {
            "column": 37,
            "index": 95,
            "line": 4,
          },
        },
        "useResetStyles2": {
          "end": {
            "column": 8,
            "index": 265,
            "line": 10,
          },
          "start": {
            "column": 37,
            "index": 216,
            "line": 8,
          },
        },
      }
    `);
  });

  it('collects "griffel-" comment directives for makeStyles and makeResetStyles', () => {
    const sourceCode = `
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

    const result = transformWithMetadata(sourceCode, 'test.styles.ts');

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

  it('preserves source order of declarators (entries are not reversed)', () => {
    const sourceCode = `
import { makeStyles, makeResetStyles } from '@griffel/react';

export const useFirst = makeStyles({ root: { color: 'red' } });
export const useSecond = makeStyles({ root: { color: 'green' } });

export const useFirstReset = makeResetStyles({ color: 'red' });
export const useSecondReset = makeResetStyles({ color: 'green' });
`;

    const result = transformWithMetadata(sourceCode, 'order.styles.ts');

    expect(Object.keys(result.metadata!.cssEntries)).toEqual(['useFirst', 'useSecond']);
    expect(Object.keys(result.metadata!.cssResetEntries)).toEqual(['useFirstReset', 'useSecondReset']);
  });

  it('preserves source order of slots within makeStyles', () => {
    const sourceCode = `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  alpha: { color: 'red' },
  beta: { color: 'green' },
  gamma: { color: 'blue' },
});
`;

    const result = transformWithMetadata(sourceCode, 'slots.styles.ts');

    expect(Object.keys(result.metadata!.cssEntries['useStyles'])).toEqual(['alpha', 'beta', 'gamma']);
    expect(Object.keys(result.metadata!.locations['useStyles'])).toEqual(['alpha', 'beta', 'gamma']);
  });
});
