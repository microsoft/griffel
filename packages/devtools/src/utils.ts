import type { DebugResult } from '@griffel/core';
import { AtomicRules, SlotInfo } from './types';

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

  const result: SlotInfo[] = [];

  slots.forEach(({ slot, rules }) => {
    const filteredRules: AtomicRules[] = [];
    rules.forEach(rule => {
      if (rule.cssRule.includes(searchTerm)) {
        filteredRules.push(rule);
      }
    });
    if (filteredRules.length) {
      result.push({ slot, rules: filteredRules });
    }
  });
  return result;
}
