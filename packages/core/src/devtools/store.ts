import { SequenceHash } from '../types';
import { SEQUENCE_PREFIX, SEQUENCE_HASH_LENGTH } from '../constants';

// TODO copied from mergeClasses.ts
const SEQUENCE_SIZE = SEQUENCE_PREFIX.length + SEQUENCE_HASH_LENGTH;

// {
//   ___181ajrl: [
//     ___6itd4x0,
//     ___1jbu1wa,
//   ],
//   ___wlm69a0: [
//     ___181ajrl,
//     ___9yjdox0,
//   ],
// };
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
  addSequenceMapping: (hash: SequenceHash, debugSequencesIds: SequenceHash[]) => {
    sequenceMapping[hash] = debugSequencesIds;
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
