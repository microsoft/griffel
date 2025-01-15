import { SEQUENCE_PREFIX, DEBUG_RESET_CLASSES } from '../constants';
import { mergeDebugTrees } from './mergeDebugTree';

export function injectDevTools(document: Document) {
  const window = document.defaultView;
  if (!window || window.__GRIFFEL_DEVTOOLS__) {
    return;
  }

  const devtools: (typeof window)['__GRIFFEL_DEVTOOLS__'] = {
    getInfo: (element: HTMLElement) => {
      const rootDebugSequenceHash = Array.from(element.classList).find(className =>
        className.startsWith(SEQUENCE_PREFIX),
      );

      const rootResetDebugClassName = Array.from(element.classList).find(className => DEBUG_RESET_CLASSES[className]);

      return mergeDebugTrees(rootDebugSequenceHash, rootResetDebugClassName);
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
