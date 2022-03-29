import { DEFINITION_LOOKUP_TABLE, SEQUENCE_PREFIX } from '../constants';
import { LookupItem, SequenceHash } from '../types';
import { MK_DEBUG } from './store';
import { DebugSequence } from './types';
import { getDirectionalClassName } from './utils';

const getDebugSequence = (sequenceHash: SequenceHash) => {
  const lookupItem: LookupItem | undefined = DEFINITION_LOOKUP_TABLE[sequenceHash];
  if (lookupItem === undefined) {
    return undefined;
  }
  const classesMapping = lookupItem[0];
  const direction = lookupItem[1];

  const node: DebugSequence = {
    sequenceHash,
    direction,
    children: [],
  };

  // get children
  const childrenSequenceHashes = MK_DEBUG.getSequenceMapping(node.sequenceHash);
  if (childrenSequenceHashes) {
    childrenSequenceHashes.forEach((childHashSequence: SequenceHash) => {
      const child = getDebugSequence(childHashSequence);
      if (child) {
        node.children.push(child);
      }
    });
  }

  // if it's leaf (makeStyle node), get css rules
  if (!node.children.length) {
    node.rules = [];
    Object.values(classesMapping).forEach(classes => {
      const atomicClassName = getDirectionalClassName(classes, direction);

      const mapData = MK_DEBUG.getSequenceDetails(sequenceHash);
      if (mapData) {
        node.slot = mapData.slotName;
      }

      const cssRule = MK_DEBUG.getCSSRules().find(cssRule => {
        return cssRule.includes(atomicClassName);
      });

      node.rules!.push({ cssRule: cssRule!, className: atomicClassName });
    });
  }

  return node;
};

export function injectDevTools() {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  window.__MAKESTYLES_DEVTOOLS__ = {
    getInfo: element => {
      const rootSequenceHash = Array.from(element.classList).find(className => className.startsWith(SEQUENCE_PREFIX));
      if (rootSequenceHash === undefined) {
        return undefined;
      }

      return getDebugSequence(rootSequenceHash);
    },
  };
}
