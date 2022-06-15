import type { DebugResult } from '@griffel/core';
import { SlotInfo } from './types';

export function getRulesBySlots(node: DebugResult, result: SlotInfo[] = []): SlotInfo[] {
  if (node.children.length === 0 && node.slot) {
    const { debugClassNames, rules, slot, sourceMap } = node;

    return [
      ...result,
      {
        slot,
        sourceMap,
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

  return slots.reduce<SlotInfo[]>((acc, { slot, rules, sourceMap }) => {
    const filteredRules = rules.filter(rule => rule.cssRule.includes(searchTerm));

    if (filteredRules.length) {
      return [...acc, { slot, rules: filteredRules, sourceMap }];
    }

    return acc;
  }, []);
}
