import { SequenceHash } from '../types';
import { SEQUENCE_PREFIX, SEQUENCE_HASH_LENGTH, DEBUG_MERGE_ORDER_SEQUENCE_PREFIX } from '../constants';
import hash from '@emotion/hash';

// TODO copied from mergeClasses.ts
const SEQUENCE_SIZE = SEQUENCE_PREFIX.length + SEQUENCE_HASH_LENGTH;

const createDebugSequenceHash = (sequenceHash: SequenceHash, mergeOrderSequenceHash?: SequenceHash) =>
  mergeOrderSequenceHash ? sequenceHash + mergeOrderSequenceHash : sequenceHash;

const getMergeOrderSequenceHash = (className: string, sequenceIndex: number) => {
  const mergeOrderSequenceHash = className.substr(
    sequenceIndex + SEQUENCE_SIZE,
    DEBUG_MERGE_ORDER_SEQUENCE_PREFIX.length + SEQUENCE_HASH_LENGTH,
  );
  return mergeOrderSequenceHash.startsWith(DEBUG_MERGE_ORDER_SEQUENCE_PREFIX) ? mergeOrderSequenceHash : undefined;
};

const extractSequenceHash = (debugSequenceHash: SequenceHash) => debugSequenceHash.substr(0, SEQUENCE_SIZE);

// sequenceMapping:
// ___8vm58t0_d_1b1j85c: ['___12tn0cb', '___8vm58t0']
// ___8vm58t0_d_1bugyi3: ['___8vm58t0_d_1b1j85c', '___8vm58t0']
// contains only the merged result
const sequenceMapping: Record<SequenceHash, SequenceHash[]> = {};

// {
//   ___6itd4x0: { slotName: 'root' },
//   ___1jbu1wa: { slotName: 'primary' },
//   ___9yjdox0: { slotName: 'darkHover' },
// }
// contains only makeStyles result
const sequenceDetails: Record<SequenceHash, { slotName: string }> = {};

// [
//   '.f1oou7ox{margin-left:10px;}',
//   '.f1pxv85q{margin-right:10px;}',
//   '.fcg4t7g{color:pink;}',
//   '.f163i14w{color:blue;}',
//   '.faf35ka:hover{color:red;}',
//   '.f1ja742n:hover{color:darkblue;}',
// ];
const cssRules: string[] = [];

export const MK_DEBUG = {
  getMergeOrderSequenceHash,
  createDebugSequenceHash,
  extractSequenceHash,

  /**
   *
   * @param newSequenceHash new sequence result from merging
   * @param sequences sequences being merged
   * @param mergeOrderSequences merge order hash for each sequence in `sequences`
   * @returns
   */
  addSequenceMapping: (
    newSequenceHash: SequenceHash,
    sequences: (SequenceHash | undefined)[],
    mergeOrderSequences: (SequenceHash | undefined)[],
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
    sequenceMapping[newDebugSequenceHash] = debugSequences;

    return newDebugSequenceHash;
  },
  addCSSRule: (rule: string) => {
    cssRules.push(rule);
  },
  addSequenceDetails: (sequenceHash: SequenceHash, slotName: string) => {
    sequenceDetails[sequenceHash.substring(0, SEQUENCE_SIZE)] = { slotName };
  },

  getSequenceMapping: (hash: SequenceHash): SequenceHash[] | undefined => {
    return sequenceMapping[hash];
  },
  getCSSRules: (): string[] => {
    return cssRules;
  },
  getSequenceDetails: (sequenceHash: SequenceHash): typeof sequenceDetails[string] | undefined => {
    return sequenceDetails[sequenceHash];
  },
};

(window as any).MK_DEBUG_DATA = {
  sequenceMapping,
  sequenceDetails,
  cssRules,
};
