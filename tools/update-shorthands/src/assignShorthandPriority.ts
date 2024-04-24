import type { CSSShorthands } from './types';

function updatePriorities(propertiesWithPriority: CSSShorthands, targetPriority: number = -1) {
  const effectiveProperties: CSSShorthands = {};

  for (const [property, value] of Object.entries(propertiesWithPriority)) {
    if (targetPriority === value[0]) {
      effectiveProperties[property] = value;
    }
  }

  if (Object.keys(effectiveProperties).length === 0) {
    return;
  }

  for (const [property, value] of Object.entries(effectiveProperties)) {
    const [, nestedProperties] = value;

    for (const nestedProperty of nestedProperties) {
      if (!propertiesWithPriority[nestedProperty]) {
        continue;
      }

      const currentPriority = propertiesWithPriority[property][0];
      const [nestedPriority] = propertiesWithPriority[nestedProperty];

      propertiesWithPriority[property][0] = Math.min(currentPriority, nestedPriority - 1);
    }
  }

  updatePriorities(propertiesWithPriority, targetPriority - 1);
}

export function assignShorthandPriority(preparedProperties: Record<string, string[]>): CSSShorthands {
  const propertiesWithPriority: CSSShorthands = {};

  for (const [property, value] of Object.entries(preparedProperties)) {
    propertiesWithPriority[property] = [-1, value];
  }

  updatePriorities(propertiesWithPriority);

  return propertiesWithPriority;
}
