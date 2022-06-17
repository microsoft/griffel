import { DEFINITION_LOOKUP_TABLE } from '../constants';
import { LookupItem, SequenceHash } from '../types';
import { debugData } from './store';
import { DebugSequence } from './types';
import { getDebugClassNames } from './utils';

export function getDebugTree(debugSequenceHash: SequenceHash, parentNode?: DebugSequence) {
  const lookupItem: LookupItem | undefined = DEFINITION_LOOKUP_TABLE[debugSequenceHash];
  if (lookupItem === undefined) {
    return undefined;
  }

  const parentLookupItem = parentNode ? DEFINITION_LOOKUP_TABLE[parentNode.sequenceHash] : undefined;
  const debugClassNames = getDebugClassNames(lookupItem, parentLookupItem, parentNode?.debugClassNames);

  const node: DebugSequence = {
    sequenceHash: debugSequenceHash,
    direction: lookupItem[1],
    children: [],
    debugClassNames,
  };

  const childrenSequences = debugData.getChildrenSequences(node.sequenceHash);
  childrenSequences.forEach((sequence: SequenceHash) => {
    const child = getDebugTree(sequence, node);
    if (child) {
      node.children.push(child);
    }
  });

  // if it's leaf (makeStyle node), get css rules
  if (!node.children.length) {
    node.rules = {};
    node.debugClassNames.forEach(({ className }) => {
      const mapData = debugData.getSequenceDetails(debugSequenceHash);
      if (mapData) {
        node.slot = mapData.slotName;
        node.sourceURLwithPos = mapData.sourceURLwithPos;
      }

      const cssRule = debugData.getCSSRules().find(cssRule => {
        return cssRule.includes(className);
      });

      node.rules![className] = cssRule!;
    });
  }

  return node;
}
