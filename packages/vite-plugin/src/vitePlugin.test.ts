import * as fs from 'fs-extra';
import * as path from 'path';
import * as prettier from 'prettier';
import { AliasOptions, build } from 'vite';
import * as tmp from 'tmp';

import { vitePlugin } from './vitePlugin';

type CompileOptions = {
  alias?: AliasOptions;
};

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);

// Clean up created files/folders on exit, even after exceptions
// (will not catch SIGINT on windows)
tmp.setGracefulCleanup();

async function compileSourceWithVite(entryPath: string, options: CompileOptions): Promise<string> {
  const testDir = tmp.dirSync().name;
  console.log('path.basename(entryPath)', path.basename(entryPath));

  await fs.copy(path.dirname(entryPath), testDir);

  console.log('testDir', testDir);
  await build({
    build: {
      lib: {
        entry: testDir + '/code.ts',
        fileName: 'test',
        name: 'test',
        formats: ['es'],
      },
      outDir: testDir + '/dist',
      rollupOptions: {
        external: ['@griffel/react'],
      },
    },
    plugins: [vitePlugin()],
    root: testDir,
    ...(options.alias && { resolve: { alias: options.alias } }),
  });

  return await fs.promises.readFile(testDir + '/dist/test.es.js', { encoding: 'utf-8' });
}

function fixLineEndings(value: string) {
  return String(value).replace(/\r?\n/g, '\n').trim();
}

/**
 * Test utility similar to "babel-plugin-tester".
 *
 * See https://webpack.js.org/contribute/writing-a-loader/#testing.
 */
function testFixture(fixtureName: string, options: CompileOptions = {}) {
  it(`"${fixtureName}" fixture`, async () => {
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', fixtureName);

    const tsCodePath = path.resolve(fixturePath, 'code.ts');
    const tsxCodePath = path.resolve(fixturePath, 'code.tsx');
    // Specially for cases when "code" contains syntax errors
    const txtCodePath = path.resolve(fixturePath, 'code.txt');

    const tsOutputPath = path.resolve(fixturePath, 'output.ts');
    const tsxOutputPath = path.resolve(fixturePath, 'output.tsx');

    const inputPath = [
      fs.existsSync(tsCodePath) && tsCodePath,
      fs.existsSync(tsxCodePath) && tsxCodePath,
      fs.existsSync(txtCodePath) && txtCodePath,
    ].find(Boolean);
    const outputPath = [
      fs.existsSync(tsOutputPath) && tsOutputPath,
      fs.existsSync(tsxOutputPath) && tsxOutputPath,
    ].find(Boolean);

    const errorPath = path.resolve(fixturePath, 'error.ts');
    const expectedError = fs.existsSync(errorPath) && require(errorPath);

    if (!inputPath) {
      throw new Error(`Failed to find "code.{js,ts,tsx}" in "${fixturePath}"`);
    }

    if (!outputPath && !expectedError) {
      throw new Error(`Failed to find "output.{js,ts,tsx}" or "error.ts" in "${fixturePath}"`);
    }

    if (expectedError) {
      if (!expectedError.default) {
        throw new Error(
          `Please check that "error.ts" contains a default export with an error or regex in "${fixturePath}"`,
        );
      }
    }

    let result = '';
    // let resultError: Error | webpack.StatsError = new Error();

    try {
      result = fixLineEndings(
        prettier.format(await compileSourceWithVite(inputPath, options), {
          ...prettierConfig,
          parser: 'typescript',
        }),
      );
    } catch (err) {
      if (expectedError) {
        // resultError = err as webpack.StatsError;
      } else {
        throw err;
      }
    }

    if (outputPath) {
      const output = fixLineEndings(await fs.promises.readFile(outputPath, 'utf8'));

      expect(result).toBe(output);
      return;
    }

    if (expectedError) {
      // expect(resultError.message).toMatch(expectedError.default);
    }
  });
}

describe('vitePlugin', () => {
  // Integration fixtures for base functionality, all scenarios are tested in "@griffel/babel-preset"
  testFixture('object');

  // Asserts that aliases are resolved properly in Babel plugin
  testFixture('vite-aliases', {
    alias: {
      'non-existing-color-module': path.resolve(__dirname, '..', '__fixtures__', 'vite-aliases', 'color.ts'),
    },
  });
});
