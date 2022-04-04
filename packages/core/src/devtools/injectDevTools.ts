import { DEFINITION_LOOKUP_TABLE, SEQUENCE_PREFIX } from '../constants';
import { LookupItem, SequenceHash } from '../types';
import { MK_DEBUG } from './store';
import { DebugSequence } from './types';
import { getDirectionalClassName } from './utils';

const getDebugTree = (debugSequenceHash: SequenceHash) => {
  const lookupItem: LookupItem | undefined = DEFINITION_LOOKUP_TABLE[debugSequenceHash];
  if (lookupItem === undefined) {
    return undefined;
  }
  const classesMapping = lookupItem[0];
  const direction = lookupItem[1];

  const node: DebugSequence = {
    sequenceHash: debugSequenceHash,
    direction,
    children: [],
  };

  const childrenSequences = MK_DEBUG.getChildrenSequences(node.sequenceHash);
  childrenSequences.forEach((sequence: SequenceHash) => {
    const child = getDebugTree(sequence);
    if (child) {
      node.children.push(child);
    }
  });

  // if it's leaf (makeStyle node), get css rules
  if (!node.children.length) {
    node.rules = [];
    Object.values(classesMapping).forEach(classes => {
      const atomicClassName = getDirectionalClassName(classes, direction);

      const mapData = MK_DEBUG.getSequenceDetails(debugSequenceHash);
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

export function injectDevTools(window: (Window & typeof globalThis) | null) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (!window || typeof window === 'undefined') {
    return;
  }

  // eslint-disable-next-line no-prototype-builtins
  if (window.hasOwnProperty('__GRIFFEL_DEVTOOLS__')) {
    return;
  }

  const devtools = {
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
    configurable: true,
    get() {
      return devtools;
    },
  });
}
