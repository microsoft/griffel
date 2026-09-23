import type { CSSShorthands } from './types.ts';

// Logical inline/block shorthands (e.g. `paddingInline`, `insetBlock`) must win over their physical
// counterparts regardless of authoring order, so they get a positive priority and their longhands an
// even higher one. Deeper logical families whose longhands are themselves shorthands (e.g. logical
// borders) are left untouched.
const LOGICAL_SHORTHAND = /(?:Inline|Block)$/;

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

  const logicalShorthands = Object.keys(preparedProperties)
    .filter(
      property =>
        LOGICAL_SHORTHAND.test(property) &&
        preparedProperties[property].every(longhand => !preparedProperties[longhand]),
    )
    .sort();

  // Logical longhands (2) beat logical shorthands (1), which beat physical properties (default 0).
  for (const shorthand of logicalShorthands) {
    const longhands = propertiesWithPriority[shorthand][1];

    for (const longhand of longhands) {
      propertiesWithPriority[longhand] = [2, []];
    }

    propertiesWithPriority[shorthand] = [1, longhands];
  }

  return propertiesWithPriority;
}
