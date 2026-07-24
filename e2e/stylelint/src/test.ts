import { configureYarn, copyAssets, createTempDir, installPackages, packLocalPackage, sh } from '@griffel/e2e-utils';
import path from 'path';

const RULE = 'selector-anb-no-unmatchable';

/**
 * Runs stylelint against a single fixture file and reports whether it exited
 * cleanly along with its (merged stdout + stderr) output.
 */
async function lint(tempDir: string, file: string): Promise<{ passed: boolean; output: string }> {
  try {
    const output = await sh(`npx stylelint ${file} 2>&1`, tempDir, true);
    return { passed: true, output };
  } catch (e) {
    // `sh` rejects when stylelint exits with a non-zero code (problems found)
    return { passed: false, output: (e as Error).message };
  }
}

async function performTest() {
  let tempDir: string;

  try {
    const rootDir = path.resolve(import.meta.dirname, '..', '..', '..');
    const assetsPath = path.resolve(import.meta.dirname, 'assets');

    tempDir = createTempDir('stylelint');

    await copyAssets({ assetsPath, tempDir });
    await configureYarn({ tempDir, rootDir });

    const resolutions = [
      await packLocalPackage(rootDir, tempDir, '@griffel/postcss-syntax'),
      await packLocalPackage(rootDir, tempDir, '@griffel/babel-preset'),
    ];

    await installPackages({
      packages: ['stylelint'],
      resolutions,
      tempDir,
      rootDir,
    });
  } catch (e) {
    console.error('❌', 'Something went wrong setting up the test:');
    console.error((e as Error)?.stack ?? e);
    process.exit(1);
  }

  // Stylelint is wired to parse `*.styles.ts` files through the Griffel PostCSS custom
  // syntax (see assets/.stylelintrc.json). Each fixture asserts a different behavior.
  let failed = false;

  // 1. `green.styles.ts` has no violations — stylelint should pass.
  {
    const { passed, output } = await lint(tempDir, 'green.styles.ts');

    if (passed) {
      console.log('✅', 'green.styles.ts passed stylelint with no reported problems');
    } else {
      failed = true;
      console.error('❌', 'green.styles.ts should have passed stylelint, but problems were reported:');
      console.error(output);
    }
  }

  // 2. `error.styles.ts` has an unmatchable An+B selector — stylelint should report it.
  {
    const { passed, output } = await lint(tempDir, 'error.styles.ts');

    if (!passed && output.includes(RULE)) {
      console.log('✅', `error.styles.ts correctly reported ${RULE}`);
    } else {
      failed = true;
      console.error('❌', `error.styles.ts should have reported ${RULE}, but it did not:`);
      console.error(output);
    }
  }

  // 3. `disabled.styles.ts` has the same violation but suppresses it via a
  //    `griffel-csslint-disable` comment directive — stylelint should pass.
  {
    const { passed, output } = await lint(tempDir, 'disabled.styles.ts');

    if (passed) {
      console.log('✅', `disabled.styles.ts suppressed ${RULE} via griffel-csslint-disable`);
    } else {
      failed = true;
      console.error(
        '❌',
        `disabled.styles.ts should have suppressed ${RULE} via griffel-csslint-disable, but problems were reported:`,
      );
      console.error(output);
    }
  }

  if (failed) {
    process.exit(1);
  }
}

performTest();
