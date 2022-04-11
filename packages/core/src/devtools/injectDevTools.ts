import { DEFINITION_LOOKUP_TABLE, SEQUENCE_PREFIX } from '../constants';
import { LookupItem, SequenceHash } from '../types';
import { MK_DEBUG } from './store';
import { DebugSequence } from './types';
import { getDebugClassNames } from './utils';

const getDebugTree = (debugSequenceHash: SequenceHash, parentNode?: DebugSequence) => {
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

  const childrenSequences = MK_DEBUG.getChildrenSequences(node.sequenceHash);
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
      const mapData = MK_DEBUG.getSequenceDetails(debugSequenceHash);
      if (mapData) {
        node.slot = mapData.slotName;
      }

      const cssRule = MK_DEBUG.getCSSRules().find(cssRule => {
        return cssRule.includes(className);
      });

      node.rules![className] = cssRule!;
    });
  }

  return node;
};

export function injectDevTools(window: (Window & typeof globalThis) | null) {
    if (!window || window.hasOwnProperty('__GRIFFEL_DEVTOOLS__')) {
    return;
  }

  const devtools: typeof window['__GRIFFEL_DEVTOOLS__'] = {
    getInfo: (element: HTMLElement) => {
      const rootDebugSequenceHash = Array.from(element.classList).find(className =>
        className.startsWith(SEQUENCE_PREFIX),
      );
      if (rootDebugSequenceHash === undefined) {
        return undefined;
      }

      return getDebugTree(rootDebugSequenceHash);
    },
  };

  Object.defineProperty(window, '__GRIFFEL_DEVTOOLS__', {
    enumerable: false,
    configurable: false,
    get() {
      return devtools;
    },
  });
}
