import { SequenceHash } from '../types';
import { SEQUENCE_PREFIX, SEQUENCE_HASH_LENGTH, DEBUG_MERGE_ORDER_SEQUENCE_PREFIX } from '../constants';
import hash from '@emotion/hash';
import { DebugMergedSequences } from './types';

// TODO copied from mergeClasses.ts
const SEQUENCE_SIZE = SEQUENCE_PREFIX.length + SEQUENCE_HASH_LENGTH;

const createDebugSequenceHash = (sequenceHash: SequenceHash, mergeOrderSequenceHash?: SequenceHash) =>
  mergeOrderSequenceHash ? sequenceHash + mergeOrderSequenceHash : sequenceHash;

// sequenceMapping:
// ___8vm58t0_d_1b1j85c: ['___12tn0cb', '___8vm58t0']
// ___8vm58t0_d_1bugyi3: ['___8vm58t0_d_1b1j85c', '___8vm58t0']
// contains only the merged result
const sequenceMapping: Record<SequenceHash, DebugMergedSequences> = {};

// {
//   ___6itd4x0: { slotName: 'root' },
//   ___1jbu1wa: { slotName: 'primary' },
//   ___9yjdox0: { slotName: 'darkHover' },
// }
// contains only makeStyles result
const sequenceDetails: Record<SequenceHash, { slotName: string }> = {};

const cssRules: string[] = [];

export const MK_DEBUG = {
  extractMergeOrderSequenceHash: (className: string, sequenceIndex: number) => {
    const mergeOrderSequenceHash = className.substr(
      sequenceIndex + SEQUENCE_SIZE,
      DEBUG_MERGE_ORDER_SEQUENCE_PREFIX.length + SEQUENCE_HASH_LENGTH,
    );
    return mergeOrderSequenceHash.startsWith(DEBUG_MERGE_ORDER_SEQUENCE_PREFIX) ? mergeOrderSequenceHash : undefined;
  },

  extractSequenceHash: (debugSequenceHash: SequenceHash) => debugSequenceHash.substr(0, SEQUENCE_SIZE),

  getCachedDebugSequenceHash: (mergeCacheKey: string) => {
    for (const key in sequenceMapping) {
      if (mergeCacheKey === sequenceMapping[key].mergeCacheKey) {
        return key;
      }
    }
    return undefined;
  },

  /**
   * @param newSequenceHash new sequence result from merging
   * @param sequences sequences being merged
   * @param mergeOrderSequences merge order hash for each sequence in `sequences`
   * @param mergeCacheKey key used in mergeClasses cache
   * @returns new debug sequence, should be used as element's class name
   */
  addSequenceMapping: (
    newSequenceHash: SequenceHash,
    sequences: (SequenceHash | undefined)[],
    mergeOrderSequences: (SequenceHash | undefined)[],
    mergeCacheKey: string,
  ) => {
    const debugSequences = [];
    for (let i = 0; i < sequences.length; i++) {
      if (sequences[i]) {
        debugSequences.push(createDebugSequenceHash(sequences[i]!, mergeOrderSequences[i]));
      }
    }
    const newMergeOrderSequenceHash = debugSequences.length
      ? DEBUG_MERGE_ORDER_SEQUENCE_PREFIX + hash(debugSequences.join(' '))
      : undefined;
    const newDebugSequenceHash = createDebugSequenceHash(newSequenceHash, newMergeOrderSequenceHash);
    sequenceMapping[newDebugSequenceHash] = { debugSequences, mergeCacheKey };

    return newDebugSequenceHash;
  },
  addCSSRule: (rule: string) => {
    cssRules.push(rule);
  },
  addSequenceDetails: (sequenceHash: SequenceHash, slotName: string) => {
    sequenceDetails[sequenceHash.substring(0, SEQUENCE_SIZE)] = { slotName };
  },

  getSequenceMapping: (hash: SequenceHash): SequenceHash[] | undefined => {
    return sequenceMapping[hash]?.debugSequences;
  },
  getCSSRules: (): string[] => {
    return cssRules;
  },
  getSequenceDetails: (sequenceHash: SequenceHash): typeof sequenceDetails[string] | undefined => {
    return sequenceDetails[sequenceHash];
  },
};

window.__MAKESTYLES_DEBUG_DATA__ = {
  sequenceMapping,
  sequenceDetails,
  cssRules,
};
