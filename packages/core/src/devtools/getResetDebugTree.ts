import { DEBUG_RESET_CLASSES } from '../constants';
import type { SequenceHash } from '../types';
import { debugData } from './store';
import type { DebugSequence } from './types';

export function getResetDebugTree(debugSequenceHash: SequenceHash, parentNode?: DebugSequence) {
  const resetClass = DEBUG_RESET_CLASSES[debugSequenceHash];
  if (resetClass === undefined) {
    return undefined;
  }

  const debugClassNames = [{ className: debugSequenceHash }];

  const node: DebugSequence = {
    sequenceHash: debugSequenceHash,
    direction: 'ltr',
    children: [],
    debugClassNames,
  };

  node.rules = {};
  node.debugClassNames.forEach(({ className }) => {
    node.slot = 'makeResetStyles()';

    const cssRule = debugData.getCSSRules().find(cssRule => {
      return cssRule.includes(className);
    });

    node.rules![className] = cssRule!;
  });

  return node;
}
