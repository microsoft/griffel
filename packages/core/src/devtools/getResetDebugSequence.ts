import { DEBUG_RESET_CLASSES } from '../constants';
import type { SequenceHash } from '../types';
import { debugData } from './store';
import type { DebugSequence } from './types';

export function getResetDebugSequence(debugSequenceHash: SequenceHash) {
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
  node.slot = 'makeResetStyles()';

  const [{ className }] = node.debugClassNames;
  const cssRules = debugData.getCSSRules().filter(cssRule => {
    return cssRule.includes(`.${className}`);
  });

  node.rules![className] = cssRules.join('');

  return node;
}
