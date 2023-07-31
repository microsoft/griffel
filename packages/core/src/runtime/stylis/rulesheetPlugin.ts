import type { Element, Middleware } from 'stylis';

export type RulesheetPluginCallback = (type: Element, rule: string) => void;

/**
 * The same plugin as in stylis, but this version also has "element" argument.
 */
export function rulesheetPlugin(callback: RulesheetPluginCallback): Middleware {
  return function (element) {
    if (!element.root) {
      if (element.return) {
        callback(element, element.return);
      }
    }
  };
}
