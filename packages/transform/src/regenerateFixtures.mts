/**
 * Utility script to regenerate fixture outputs for transform package
 * This can be used when the transform logic changes or when moving fixtures from babel-preset
 */

import * as fs from 'fs';
import * as path from 'path';
import prettier from 'prettier';
import { transformSync, type TransformOptions } from './transformSync.mjs';

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);
const fixturesDir = path.join(__dirname, '..', '__fixtures__');

/**
 * Regenerates output for a specific fixture
 */
export function regenerateFixture(fixtureName: string, transformOptions: Partial<TransformOptions> = {}) {
  const fixturePath = path.resolve(fixturesDir, fixtureName);
  
  const tsCodePath = path.resolve(fixturePath, 'code.ts');
  const tsxCodePath = path.resolve(fixturePath, 'code.tsx');
  
  const inputPath = [
    fs.existsSync(tsCodePath) && tsCodePath,
    fs.existsSync(tsxCodePath) && tsxCodePath,
  ].find(Boolean);
  
  if (!inputPath) {
    throw new Error(`Failed to find "code.{ts,tsx}" in "${fixturePath}"`);
  }
  
  const inputCode = fs.readFileSync(inputPath, 'utf8');
  const extension = path.extname(inputPath);
  
  const defaultTransformOptions: TransformOptions = {
    filename: inputPath,
    modules: ['@griffel/react'],
    babelOptions: {
      presets: ['@babel/preset-typescript'],
    },
    ...transformOptions,
  };
  
  const result = transformSync(inputCode, defaultTransformOptions);
  
  const formattedResult = prettier.format(result.code, {
    ...prettierConfig,
    parser: 'typescript',
  });
  
  const outputPath = path.resolve(fixturePath, `output${extension}`);
  fs.writeFileSync(outputPath, formattedResult);
  
  console.log(`✅ Regenerated ${fixtureName}`);
  return formattedResult;
}

/**
 * List all available fixtures
 */
export function listFixtures() {
  const fixtures = fs.readdirSync(fixturesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();
    
  return fixtures;
}

// For CLI usage during development
if (require.main === module) {
  const fixtureName = process.argv[2];
  
  if (!fixtureName) {
    console.log('Available fixtures:');
    listFixtures().forEach(name => console.log(`  ${name}`));
    console.log('\nUsage: node regenerateFixtures.mjs <fixture-name>');
    process.exit(1);
  }
  
  try {
    regenerateFixture(fixtureName);
  } catch (error) {
    console.error(`❌ Failed to regenerate ${fixtureName}:`, error);
    process.exit(1);
  }
}