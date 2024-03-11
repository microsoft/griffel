import { type CSSShorthands } from './types';

export function assignShorthandPriority(shorthandProperties: CSSShorthands): CSSShorthands {
  const propertiesWithPriority = { ...shorthandProperties };

  Object.keys(shorthandProperties)
    .reverse()
    .forEach(key => {
      const [priority, properties] = propertiesWithPriority[key];
      const maxPriorityFromProperties = Math.min(
        ...properties.map(property => propertiesWithPriority[property]?.[0] ?? 0),
      );

      propertiesWithPriority[key] = [priority + maxPriorityFromProperties, properties];
    });

  return propertiesWithPriority;
}
