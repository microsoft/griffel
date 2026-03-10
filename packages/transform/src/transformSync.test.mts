import * as fs from 'node:fs';
import NativeModule from 'node:module';
import * as path from 'node:path';
import { format } from 'prettier';
import { describe, it, expect, vi } from 'vitest';

import { ASSET_TAG_OPEN, ASSET_TAG_CLOSE } from './constants.mjs';
import type { TransformResolver } from './evaluation/module.mjs';
import { transformSync, type TransformOptions } from './transformSync.mjs';

const nodeResolve: TransformResolver = (id, opts) =>
  (NativeModule as unknown as { _resolveFilename: (id: string, options: unknown) => string })._resolveFilename(id, opts);

type TestCase = {
  title: string;
  fixture: string;

  error?: RegExp;
  outputFixture?: string;

  only?: boolean;
  transformOptions?: Omit<TransformOptions, 'filename'>;

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
function normalizeAssetOutputs(
  code: string,
  meta: string,
  fixtureDir: string,
): { code: string; meta: string } {
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
        {
          action: path.resolve(fixturesDir, 'config-evaluation-rules', 'sampleEvaluator.cjs'),
        },
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
      modules: ['custom-package'],
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
