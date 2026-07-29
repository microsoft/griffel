import {
  configureYarn,
  copyAssets,
  createTempDir,
  installPackages,
  packLocalPackage,
  removeTempDir,
  sh,
} from '@griffel/e2e-utils';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..', '..');
const RULE = 'selector-anb-no-unmatchable';

/** Linting a single fixture file measures well under a second. */
const STYLELINT_TIMEOUT = 15_000;

describe('stylelint with @griffel/postcss-syntax', () => {
  let tempDir: string;

  /**
   * Runs stylelint against a single fixture file and reports whether it exited cleanly along with
   * its output. `sh` rejects when stylelint exits with a non-zero code i.e. problems were found.
   */
  async function lint(file: string): Promise<{ passed: boolean; output: string }> {
    try {
      return {
        passed: true,
        output: await sh(`npx stylelint ${file}`, tempDir, { pipeOutputToResult: true, timeout: STYLELINT_TIMEOUT }),
      };
    } catch (e) {
      return { passed: false, output: (e as Error).message };
    }
  }

  beforeAll(async () => {
    tempDir = createTempDir('stylelint');

    await copyAssets({ assetsPath: path.resolve(import.meta.dirname, 'assets'), tempDir });
    await configureYarn({ tempDir, rootDir: ROOT_DIR });

    const resolutions = [
      await packLocalPackage(ROOT_DIR, tempDir, '@griffel/postcss-syntax'),
      await packLocalPackage(ROOT_DIR, tempDir, '@griffel/transform-shaker'),
      await packLocalPackage(ROOT_DIR, tempDir, '@griffel/transform'),
    ];

    await installPackages({ packages: ['stylelint'], resolutions, tempDir, rootDir: ROOT_DIR });
  });

  afterAll(() => removeTempDir(tempDir));

  // Stylelint is wired to parse `*.styles.ts` files through the Griffel PostCSS custom syntax (see
  // `assets/.stylelintrc.json`). Each fixture asserts a different behavior.

  it('reports no problems for styles without violations', async () => {
    const { passed, output } = await lint('green.styles.ts');

    expect(passed, `green.styles.ts should have passed stylelint, but problems were reported:\n${output}`).toBe(true);
  });

  it(`reports ${RULE} for an unmatchable An+B selector`, async () => {
    const { passed, output } = await lint('error.styles.ts');

    expect(passed, `error.styles.ts should have been rejected by stylelint:\n${output}`).toBe(false);
    expect(output).toContain(RULE);
  });

  it('honours a griffel-csslint-disable comment directive', async () => {
    const { passed, output } = await lint('disabled.styles.ts');

    expect(
      passed,
      `disabled.styles.ts should have suppressed ${RULE} via griffel-csslint-disable, but problems were reported:\n${output}`,
    ).toBe(true);
  });
});
