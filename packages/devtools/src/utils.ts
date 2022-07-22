import type { DebugResult } from '@griffel/core';
import type { SlotInfo, AtomicRules } from './types';

export function getRulesBySlots(node: DebugResult, result: SlotInfo[] = []): SlotInfo[] {
  if (node.children.length === 0 && node.slot) {
    const { debugClassNames, rules, slot, sourceURL } = node;

    return [
      ...result,
      {
        slot,
        sourceURL,
        rules: debugClassNames.reduce((acc, { className, overriddenBy }) => {
          if (className) {
            acc.push({
              cssRule: rules![className],
              overriddenBy,
            });
          }

          return acc;
        }, [] as AtomicRules[]),
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

  return slots.reduce<SlotInfo[]>((acc, { slot, rules, sourceURL }) => {
    const filteredRules = rules.filter(rule => rule.cssRule.includes(searchTerm));

    if (filteredRules.length) {
      return [...acc, { slot, rules: filteredRules, sourceURL }];
    }

    return acc;
  }, []);
}
