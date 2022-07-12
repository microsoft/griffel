// @ts-expect-error
import packageJson from '../../package.json';
// Glob imports handled by esbuild plugin
// @ts-expect-error
import * as implementations from '../implementations/**/index.ts?(x)';
import type { ComponentsType } from '../types';

interface ImplementationsImport {
  default: { default: any }[];
  filenames: string[];
}

interface ImplementationType {
  components: ComponentsType;
  name: string;
  version: string;
}

const implementationsObject = (implementations as ImplementationsImport).filenames.reduce((obj, filename, i) => {
  // skip this file
  if (filename.includes('implementations/index.ts')) {
    return obj;
  }

  const components = implementations.default[i].default;
  // paths are normalized '../implementations/<implem>/index.ts'
  const name = filename.split('/')[2];
  const version = packageJson.dependencies[name] ?? '';
  obj[name] = { components, name, version };
  return obj;
}, {} as Record<string, ImplementationType>);

export default implementationsObject;
