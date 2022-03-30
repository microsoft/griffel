import { SequenceHash } from '../types';
import { SEQUENCE_PREFIX, SEQUENCE_SIZE } from '../constants';
import { mergeClassesCachedResults } from '../mergeClasses';

const sequenceDetails: Record<SequenceHash, { slotName: string }> = {};

const cssRules: string[] = [];

export const MK_DEBUG = {
  getChildrenSequences: (debugSequenceHash: SequenceHash): SequenceHash[] => {
    for (const key in mergeClassesCachedResults) {
      const sequenceClassName = mergeClassesCachedResults[key].split(' ')?.[0];
      if (sequenceClassName === debugSequenceHash) {
        // key of the mergeClasses cache contains merge order
        return key
          .split(SEQUENCE_PREFIX)
          .filter(sequence => sequence.length)
          .map(sequence => SEQUENCE_PREFIX + sequence);
      }
    }
    return [];
  },

  addCSSRule: (rule: string) => {
    cssRules.push(rule);
  },
  addSequenceDetails: (sequenceHash: SequenceHash, slotName: string) => {
    sequenceDetails[sequenceHash.substring(0, SEQUENCE_SIZE)] = { slotName };
  },

  getCSSRules: (): string[] => {
    return cssRules;
  },
  getSequenceDetails: (sequenceHash: SequenceHash): typeof sequenceDetails[string] | undefined => {
    return sequenceDetails[sequenceHash];
  },
};
