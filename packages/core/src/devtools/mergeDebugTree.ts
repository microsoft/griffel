import { getDebugTree } from './getDebugTree';
import { getResetDebugTree } from './getResetDebugTree';
import type { DebugSequence } from './types';

export function mergeDebugTrees(
  atomicClases: string | undefined,
  resetClassName: string | undefined,
): DebugSequence | undefined {
  const debugResultRootAtomic = atomicClases ? getDebugTree(atomicClases) : undefined;
  const debugResultRootReset = resetClassName ? getResetDebugTree(resetClassName) : undefined;

  if (!debugResultRootAtomic && !debugResultRootReset) {
    return undefined;
  }

  if (!debugResultRootAtomic) {
    return debugResultRootReset;
  }

  if (!debugResultRootReset) {
    return debugResultRootAtomic;
  }

  const debugResultRoot: DebugSequence = {
    sequenceHash: debugResultRootAtomic.sequenceHash + debugResultRootReset.sequenceHash,
    direction: debugResultRootAtomic.direction,
    children: [debugResultRootAtomic, debugResultRootReset],
    debugClassNames: [...debugResultRootAtomic.debugClassNames, ...debugResultRootReset.debugClassNames],
  };

  return debugResultRoot;
}
