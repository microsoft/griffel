import { LAYER, MEDIA, SUPPORTS } from 'stylis';
import type { Middleware } from 'stylis';

export const sortClassesInAtRulesPlugin: Middleware = element => {
  switch (element.type) {
    case MEDIA:
    case SUPPORTS:
    case LAYER:
      if (Array.isArray(element.children)) {
        element.children.sort((a, b) => (a.props[0] > b.props[0] ? 1 : -1));
      }
  }
};
