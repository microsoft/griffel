import type { DebugResult } from '@griffel/core';
import { SlotInfo } from './types';

export function getRulesBySlots(root: DebugResult) {
  const result: SlotInfo[] = [];
  const traverse = (node: DebugResult) => {
    if (!node.children.length && node.slot) {
      const { debugClassNames, rules, slot } = node;
      result.push({
        slot,
        rules: debugClassNames.map(({ className, overriddenBy }) => {
          return {
            cssRule: rules![className],
            overriddenBy,
          };
        }),
      });
      return;
    }

    node.children.reverse().forEach(child => {
      traverse(child);
    });
  };
  traverse(root);
  return result;
}
