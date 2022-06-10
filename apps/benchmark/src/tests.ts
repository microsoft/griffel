import implementations from './implementations';
import Tree from './scenarios/Tree';
import SierpinskiTriangle from './scenarios/SierpinskiTriangle';
import { BenchmarkParameters, ComponentsType } from './types';

const packageNames = Object.keys(implementations);

interface BenchmarkTest extends BenchmarkParameters {
  version: string;
  name: string;
}

const createTestBlock = (fn: (components: ComponentsType) => BenchmarkParameters) => {
  return packageNames.reduce((testSetups, packageName) => {
    const { name, components, version } = implementations[packageName];
    // TODO handle Provider
    const { Component, getComponentProps, sampleCount, type } = fn(components);

    testSetups[packageName] = {
      Component,
      getComponentProps,
      sampleCount,
      // Provider,
      type,
      version,
      name,
    };
    return testSetups;
  }, {} as Record<string, BenchmarkTest>);
};

const tests = {
  'Mount deep tree': createTestBlock(components => ({
    type: 'mount' as const,
    Component: Tree,
    getComponentProps: () => ({ breadth: 2, components, depth: 7, id: 0, wrap: 1 }),
    Provider: components.Provider,
    sampleCount: 50,
  })),
  'Mount wide tree': createTestBlock(components => ({
    type: 'mount',
    Component: Tree,
    getComponentProps: () => ({ breadth: 6, components, depth: 3, id: 0, wrap: 2 }),
    Provider: components.Provider,
    sampleCount: 50,
  })),
  'Update dynamic styles': createTestBlock(components => ({
    type: 'update',
    Component: SierpinskiTriangle,
    getComponentProps: ({ cycle }: { cycle: number }) => {
      return { components, s: 200, renderCount: cycle, x: 0, y: 0 };
    },
    Provider: components.Provider,
    sampleCount: 100,
  })),
};

export default tests;
