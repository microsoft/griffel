import type { CSSClasses, LookupItem } from '../types';
import type { DebugAtomicClassName, DebugSequence } from './types';

function getDirectionalClassName(classes: CSSClasses, direction: 'ltr' | 'rtl'): string {
  return Array.isArray(classes) ? (direction === 'rtl' ? classes[1] : classes[0]) : classes || '';
}

export function getDebugClassNames(
  lookupItem: LookupItem,
  parentLookupItem?: LookupItem,
  parentDebugClassNames?: DebugAtomicClassName[],
  overridingSiblings?: DebugSequence[],
): DebugAtomicClassName[] {
  const classesMapping = lookupItem[0];
  const direction = lookupItem[1];

  return Object.entries(classesMapping).map(([propertyHash, classes]) => {
    const className = getDirectionalClassName(classes, direction);

    let overriddenBy: string | undefined;
    if (parentDebugClassNames && parentLookupItem) {
      const matching = parentDebugClassNames.find(({ className: parentClassName }) => parentClassName === className);

      if (!matching && parentLookupItem[0][propertyHash]) {
        // parent node does not have current className (style), but has current selector:
        // style is overriden in current merging by another rule in sibling node
        overriddenBy = getDirectionalClassName(parentLookupItem[0][propertyHash], parentLookupItem[1]);
      } else if (matching && parentLookupItem[0][propertyHash]) {
        // parent node has current className (style), and has current selector:
        // case 1. style is not overriden during current merging; it may be overriden in higher level of merging
        // case 2. style is overriden in current merging by exactly the same rule in sibling nodes
        const siblingHasSameRule = overridingSiblings
          ? overridingSiblings.filter(
              ({ debugClassNames }) =>
                debugClassNames.filter(({ className: siblingClassName }) => siblingClassName === className).length > 0,
            ).length > 0
          : false;
        overriddenBy = siblingHasSameRule
          ? matching.className // case 2
          : matching.overriddenBy; // case 1
      } else if (!matching && !parentLookupItem[0][propertyHash]) {
        // parent node does not have current className (style), and does not have current selector:
        // this case is not possible
        overriddenBy = undefined;
      } else if (matching && !parentLookupItem[0][propertyHash]) {
        // parent node has current className (style), but does not have current selector:
        // this case is not possible
        overriddenBy = undefined;
      }
    }

    return {
      className,
      overriddenBy,
    };
  });
}
