import type { DebugResult } from '@griffel/core';
import { SlotInfo } from './types';

export function getRulesBySlots(node: DebugResult, result: SlotInfo[] = []): SlotInfo[] {
  if (node.children.length === 0 && node.slot) {
    const { debugClassNames, rules, slot, sourceLoc } = node;

    return [
      ...result,
      {
        slot,
        sourceLoc,
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

  return slots.reduce<SlotInfo[]>((acc, { slot, rules, sourceLoc }) => {
    const filteredRules = rules.filter(rule => rule.cssRule.includes(searchTerm));

    if (filteredRules.length) {
      return [...acc, { slot, rules: filteredRules, sourceLoc }];
    }

    return acc;
  }, []);
}
