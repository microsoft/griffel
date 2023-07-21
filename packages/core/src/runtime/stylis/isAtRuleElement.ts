import { LAYER, MEDIA, SUPPORTS } from 'stylis';
import type { Element } from 'stylis';

export function isAtRuleElement(element: Element): boolean {
  switch (element.type) {
    case '@container':
    case MEDIA:
    case SUPPORTS:
    case LAYER:
      return true;
  }

  return false;
}
