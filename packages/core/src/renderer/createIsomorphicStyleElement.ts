import { IsomorphicStyleElement } from '../types';

/**
 * @param target - browser document
 * @returns a real HTMLStyleElement or an SSR polyfill
 */
export function createIsomorphicStyleElement(target: Document | undefined): IsomorphicStyleElement {
  if (target) {
    return target.createElement('style') as unknown as IsomorphicStyleElement;
  }

  return {
    __attributes: {},
    setAttribute(name: string, value: string) {
      this.__attributes![name] = value;
    },
    sheet: {
      __cssRules: [],
      cssRules: {
        item() {
          console.error('sheet.item(index) is not supported in SSR');
          return null;
        },
        length: 0,
      },
      insertRule(rule: string) {
        return this.__cssRules!.push(rule);
      },
    },
    dataset: {},
    media: '',
  };
}
