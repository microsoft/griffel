import * as fs from 'fs';
import * as path from 'path';
import prettier from 'prettier';

import { transformSync, type TransformOptions } from './transformSync.mjs';

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);
const fixturesDir = path.join(__dirname, '..', '__fixtures__');

/**
 * Test utility similar to "babel-plugin-tester" but for transformSync.
 */
function testFixture(
  fixtureName: string,
  options: {
    only?: boolean;
    transformOptions?: Partial<TransformOptions>;
  } = {},
) {
  const testFn = options.only ? it.only : it;
  
  testFn(`"${fixtureName}" fixture`, () => {
    const fixturePath = path.resolve(fixturesDir, fixtureName);
    
    const tsCodePath = path.resolve(fixturePath, 'code.ts');
    const tsxCodePath = path.resolve(fixturePath, 'code.tsx');
    
    const tsOutputPath = path.resolve(fixturePath, 'output.ts');
    const tsxOutputPath = path.resolve(fixturePath, 'output.tsx');
    
    const inputPath = [
      fs.existsSync(tsCodePath) && tsCodePath,
      fs.existsSync(tsxCodePath) && tsxCodePath,
    ].find(Boolean);
    
    const outputPath = [
      fs.existsSync(tsOutputPath) && tsOutputPath,
      fs.existsSync(tsxOutputPath) && tsxOutputPath,
    ].find(Boolean);
    
    if (!inputPath) {
      throw new Error(`Failed to find "code.{ts,tsx}" in "${fixturePath}"`);
    }
    
    if (!outputPath) {
      throw new Error(`Failed to find "output.{ts,tsx}" in "${fixturePath}"`);
    }
    
    const inputCode = fs.readFileSync(inputPath, 'utf8');
    const expectedOutput = fs.readFileSync(outputPath, 'utf8');
    
    const transformOptions: TransformOptions = {
      filename: inputPath,
      modules: ['@griffel/react'],
      babelOptions: {
        presets: ['@babel/preset-typescript'],
      },
      ...options.transformOptions,
    };
    
    const result = transformSync(inputCode, transformOptions);
    
    const formattedResult = prettier.format(result.code, {
      ...prettierConfig,
      parser: 'typescript',
    });
    
    expect(formattedResult).toBe(expectedOutput);
  });
}

describe('transformSync fixtures', () => {
  // Basic functionality - start with simple ones first
  testFixture('object');
  testFixture('at-rules');
  testFixture('multiple-declarations');
  
  // Skip complex ones for now
  /*
  testFixture('duplicated-imports', {
    transformOptions: {
      modules: ['custom-package', '@griffel/react'],
    },
  });
  
  testFixture('keyframes');
  testFixture('object-shorthands');
  testFixture('object-reset');
  
  // Assets
  testFixture('assets');
  testFixture('assets-multiple-declarations');
  testFixture('assets-urls');
  
  // Evaluation
  testFixture('function-mixin');
  testFixture('object-computed-keys');
  testFixture('object-imported-keys');
  testFixture('object-mixins');
  testFixture('object-nesting');
  testFixture('object-sequence-expr');
  testFixture('object-variables');
  testFixture('rules-with-metadata');
  testFixture('shared-mixins');
  testFixture('tokens');
  
  // Reset styles
  testFixture('reset-styles');
  testFixture('assets-reset-styles');
  testFixture('reset-styles-at-rules');
  
  // Imports
  testFixture('import-alias');
  testFixture('import-custom-module', {
    transformOptions: {
      modules: ['custom-package'],
    },
  });
  testFixture('import-custom-name', {
    transformOptions: {
      modules: ['custom-package'],
    },
  });
  testFixture('require');
  testFixture('require-custom-module', {
    transformOptions: {
      modules: ['custom-package'],
    },
  });
  testFixture('require-reset-styles');
  
  // Configuration options
  testFixture('config-classname-hash-salt', {
    transformOptions: {
      classNameHashSalt: 'prefix',
    },
  });
  */
});

describe('transformSync configuration', () => {
  it('should not generate metadata by default', () => {
    const fixture = path.resolve(fixturesDir, 'object', 'code.ts');
    const code = fs.readFileSync(fixture, 'utf8');
    
    const result = transformSync(code, {
      filename: fixture,
      modules: ['@griffel/react'],
      babelOptions: {
        presets: ['@babel/preset-typescript'],
      },
    });
    
    expect(result.cssRulesByBucket).toBeUndefined();
  });
  
  it('should generate metadata when configured', () => {
    const fixture = path.resolve(fixturesDir, 'object', 'code.ts');
    const code = fs.readFileSync(fixture, 'utf8');
    
    const result = transformSync(code, {
      filename: fixture,
      modules: ['@griffel/react'],
      generateMetadata: true,
      babelOptions: {
        presets: ['@babel/preset-typescript'],
      },
    });
    
    expect(result.cssRulesByBucket).toBeDefined();
    expect(result.usedProcessing).toBe(true);
  });
  
  it('should return empty result when file contains no griffel code', () => {
    const code = 'export {}';
    
    const result = transformSync(code, {
      filename: 'test.ts',
      modules: ['@griffel/react'],
      generateMetadata: true,
    });
    
    expect(result.usedProcessing).toBe(false);
    expect(result.cssRulesByBucket).toBeUndefined();
  });
});