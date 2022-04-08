import { CSSClasses, LookupItem } from '../types';
import { DebugAtomicClassName } from './types';

function getDirectionalClassName(classes: CSSClasses, direction: 'ltr' | 'rtl'): string {
  return Array.isArray(classes) ? (direction === 'rtl' ? classes[1] : classes[0]) : classes;
}

export function getDebugClassNames(
  lookupItem: LookupItem,
  parentLookupItem?: LookupItem,
  parentDebugClassNames?: DebugAtomicClassName[],
): DebugAtomicClassName[] {
  const classesMapping = lookupItem[0];
  const direction = lookupItem[1];

  return Object.entries(classesMapping).map(([propertyHash, classes]) => {
    const className = getDirectionalClassName(classes, direction);

    let overriddenBy: string | undefined;
    if (parentDebugClassNames && parentLookupItem) {
      const matching = parentDebugClassNames.find(({ className: parentClassName }) => parentClassName === className);

      if (!matching && parentLookupItem[0][propertyHash]) {
        // style is overriden in current merging
        overriddenBy = getDirectionalClassName(parentLookupItem[0][propertyHash], parentLookupItem[1]);
      } else {
        // overridden status come from higher level of merging
        overriddenBy = matching?.overriddenBy;
      }
    }

    return {
      className,
      overriddenBy,
    };
  });
}
