import type { CSSShorthands } from './types';

const ADDITIONAL_SHORTHANDS: Record<string, string[]> = {
  border: ['borderTop', 'borderRight', 'borderBottom', 'borderLeft'],
};

export function mergeShorthandProperties(shorthandProperties: CSSShorthands): CSSShorthands {
  return Object.fromEntries(
    Object.entries(shorthandProperties).map(([property, [priority, properties]]) => {
      const mergedProperties = properties.concat(ADDITIONAL_SHORTHANDS[property] ?? []).flatMap(property => {
        return shorthandProperties[property] ? shorthandProperties[property][1].concat(property) : property;
      });
      const uniqueProperties = Array.from(new Set(mergedProperties));

      return [property, [priority, uniqueProperties]];
    }),
  );
}
