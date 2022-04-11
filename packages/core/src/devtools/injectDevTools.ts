import { SEQUENCE_PREFIX } from '../constants';
import { getDebugTree } from './getDebugTree';

export function injectDevTools(document: Document) {
  const window = document.defaultView;
  if (!window || Object.prototype.hasOwnProperty.call(window, '__GRIFFEL_DEVTOOLS__')) {
    return;
  }

  const devtools: typeof window['__GRIFFEL_DEVTOOLS__'] = {
    getInfo: (element: HTMLElement) => {
      const rootDebugSequenceHash = Array.from(element.classList).find(className =>
        className.startsWith(SEQUENCE_PREFIX),
      );
      if (rootDebugSequenceHash === undefined) {
        return undefined;
      }

      return getDebugTree(rootDebugSequenceHash);
    },
  };

  Object.defineProperty(window, '__GRIFFEL_DEVTOOLS__', {
    configurable: false,
    enumerable: false,
    get() {
      return devtools;
    },
  });
}
