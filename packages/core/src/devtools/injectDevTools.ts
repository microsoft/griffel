import { SEQUENCE_PREFIX } from '../constants';
import { getDebugTree } from './getDebugTree';

export function injectDevTools(window: (Window & typeof globalThis) | null) {
  if (!window || window.hasOwnProperty('__GRIFFEL_DEVTOOLS__')) {
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
    enumerable: false,
    configurable: false,
    get() {
      return devtools;
    },
  });
}
