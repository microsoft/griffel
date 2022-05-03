import type { DebugResult } from '@griffel/core';
import { SlotInfo } from './types';

export function getRulesBySlots(node: DebugResult, result: SlotInfo[] = []): SlotInfo[] {
  if (node.children.length === 0 && node.slot) {
    const { debugClassNames, rules, slot } = node;

    return [
      ...result,
      {
        slot,
        rules: debugClassNames.map(({ className, overriddenBy }) => {
          return {
            cssRule: rules![className],
            overriddenBy,
          };
        }),
      },
    ];
  }

  return node.children.reverse().reduce((acc, child) => {
    return [...acc, ...getRulesBySlots(child)];
  }, result);
}

export function filterSlots(slots: SlotInfo[], searchTerm: string) {
  if (!searchTerm.length) {
    return slots;
  }

  const clone = JSON.parse(JSON.stringify(slots)) as SlotInfo[];
  return clone.filter(slot => {
    slot.rules = slot.rules.filter(rule => rule.cssRule.includes(searchTerm));
    return slot.rules.length;
  });
}
