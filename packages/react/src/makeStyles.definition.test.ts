import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const fixtureSource = `
  import { makeStyles as makeCoreStyles } from '@griffel/core';
  import { makeStyles as makeReactStyles } from './makeStyles.js';

  const getCoreStyles = makeCoreStyles({
    coreSpecialHeading: { color: 'red' },
  });
  const coreStyles = getCoreStyles({} as Parameters<typeof getCoreStyles>[0]);
  coreStyles.coreSpecialHeading;

  const useReactStyles = makeReactStyles({
    reactSpecialHeading: { color: 'red' },
  });
  const reactStyles = useReactStyles();
  reactStyles.reactSpecialHeading;

  const useExplicitStyles = makeReactStyles<'root'>({ root: { color: 'red' } });
  useExplicitStyles().root;
`;

const fixturePath = path.join(import.meta.dirname, 'makeStyles.definition.fixture.ts');
const configPath = ts.findConfigFile(import.meta.dirname, ts.sys.fileExists, 'tsconfig.spec.json')!;
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
const compilerHost = ts.createCompilerHost(parsedConfig.options);
const originalFileExists = compilerHost.fileExists;
const originalGetSourceFile = compilerHost.getSourceFile;
const originalReadFile = compilerHost.readFile;
const isFixture = (fileName: string) => path.resolve(fileName) === path.resolve(fixturePath);

compilerHost.fileExists = fileName => isFixture(fileName) || originalFileExists(fileName);
compilerHost.readFile = fileName => (isFixture(fileName) ? fixtureSource : originalReadFile(fileName));

compilerHost.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
  if (isFixture(fileName)) {
    return ts.createSourceFile(fileName, fixtureSource, languageVersion, true);
  }

  return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
};

const program = ts.createProgram([fixturePath], parsedConfig.options, compilerHost);
const sourceFile = program.getSourceFiles().find(file => isFixture(file.fileName))!;

describe('makeStyles definition navigation', () => {
  it.each(['coreSpecialHeading', 'reactSpecialHeading'])('links %s to its style definition', propertyName => {
    let propertyAccess: ts.PropertyAccessExpression | undefined;

    function visit(node: ts.Node) {
      if (ts.isPropertyAccessExpression(node) && node.name.text === propertyName) {
        propertyAccess = node;
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    const symbol = program.getTypeChecker().getSymbolAtLocation(propertyAccess!.name);
    const declaration = symbol?.declarations?.[0];

    if (!declaration || !ts.isPropertyAssignment(declaration)) {
      throw new Error(`Expected ${propertyName} to resolve to its style property`);
    }

    expect(declaration.getSourceFile()).toBe(sourceFile);
    expect(declaration.name.getText()).toBe(propertyName);
  });

  it('supports an explicit slot generic', () => {
    const diagnostics = ts.getPreEmitDiagnostics(program).filter(diagnostic => diagnostic.file === sourceFile);

    expect(diagnostics).toEqual([]);
  });
});
