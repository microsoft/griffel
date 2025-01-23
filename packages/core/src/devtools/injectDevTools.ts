import { SEQUENCE_PREFIX, DEBUG_RESET_CLASSES } from '../constants';
import { mergeDebugSequence } from './mergeDebugSequence';

export function injectDevTools(document: Document) {
  const window = document.defaultView;
  if (!window || window.__GRIFFEL_DEVTOOLS__) {
    return;
  }

  const devtools: (typeof window)['__GRIFFEL_DEVTOOLS__'] = {
    getInfo: (element: HTMLElement) => {
      let rootDebugSequenceHash: string | undefined;
      let rootResetDebugClassName: string | undefined;

      for (const className of element.classList) {
        if (className.startsWith(SEQUENCE_PREFIX)) {
          rootDebugSequenceHash = className;
        }
        if (DEBUG_RESET_CLASSES[className]) {
          rootResetDebugClassName = className;
        }
      }

      return mergeDebugSequence(rootDebugSequenceHash, rootResetDebugClassName);
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
