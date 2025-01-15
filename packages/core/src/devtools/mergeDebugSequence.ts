import { getAtomicDebugSequenceTree } from './getAtomicDebugSequenceTree';
import { getResetDebugSequence } from './getResetDebugSequence';
import type { DebugSequence } from './types';

export function mergeDebugSequence(
  atomicClases: string | undefined,
  resetClassName: string | undefined,
): DebugSequence | undefined {
  const debugResultRootAtomic = atomicClases ? getAtomicDebugSequenceTree(atomicClases) : undefined;
  const debugResultRootReset = resetClassName ? getResetDebugSequence(resetClassName) : undefined;

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
