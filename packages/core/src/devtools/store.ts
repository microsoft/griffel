import type { SequenceHash } from '../types';
import { SEQUENCE_PREFIX, SEQUENCE_SIZE } from '../constants';
import { mergeClassesCachedResults } from '../mergeClasses';
import type { DebugSourceLoc } from './types';

const sequenceDetails: Record<SequenceHash, { slotName: string; sourceLoc?: DebugSourceLoc }> = {};

const cssRules: string[] = [];

export const debugData = {
  getChildrenSequences: (debugSequenceHash: SequenceHash): SequenceHash[] => {
    const key = Object.keys(mergeClassesCachedResults).find(key =>
      mergeClassesCachedResults[key].startsWith(debugSequenceHash),
    );

    if (key) {
      // key of the mergeClasses cache contains merge order
      return key
        .split(SEQUENCE_PREFIX)
        .filter(sequence => sequence.length)
        .map(sequence => SEQUENCE_PREFIX + sequence);
    }

    return [];
  },

  addCSSRule: (rule: string) => {
    cssRules.push(rule);
  },
  addSequenceDetails: <Slots extends string | number>(
    classNamesForSlots: Record<Slots, string>,
    sourceLoc?: DebugSourceLoc,
  ) => {
    Object.entries<string>(classNamesForSlots).forEach(([slotName, sequenceHash]) => {
      sequenceDetails[sequenceHash.substring(0, SEQUENCE_SIZE)] = { slotName, sourceLoc };
    });
  },

  getCSSRules: (): string[] => {
    return cssRules;
  },
  getSequenceDetails: (sequenceHash: SequenceHash): typeof sequenceDetails[string] | undefined => {
    return sequenceDetails[sequenceHash];
  },
};
