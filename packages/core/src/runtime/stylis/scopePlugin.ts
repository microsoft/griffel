import { LAYER, MEDIA, RULESET, SUPPORTS, SCOPE } from 'stylis';
import type { Element, Middleware } from 'stylis';

const CONTAINER_TYPE = '@container';

function isHoistableAtRule(element: Element): boolean {
  return (
    element.type === MEDIA || element.type === SUPPORTS || element.type === LAYER || element.type === CONTAINER_TYPE
  );
}

/**
 * Swaps `@scope` and a conditional at-rule that was its child: clones `scope`
 * with the at-rule's children, makes the at-rule wrap the clone, and inherits
 * the scope's tree position (`root`/`parent`) — so `rulesheetPlugin` treats
 * the wrapper the same way it would have treated the original scope.
 */
function hoistOutOfScope(scope: Element, atRule: Element): Element {
  const scopeClone: Element = { ...scope, children: atRule.children, return: '', root: atRule, parent: atRule };

  atRule.children = [scopeClone];
  atRule.return = '';
  atRule.root = scope.root;
  atRule.parent = scope.parent;

  return atRule;
}

function stripPrefix(elements: Element[], rootSelector: string): void {
  for (const element of elements) {
    if (element.type === RULESET && Array.isArray(element.props)) {
      element.props = element.props.map(value => {
        if (value.startsWith(rootSelector)) {
          return value.slice(rootSelector.length + 1 /* +1 for space */);
        }

        return value;
      });
    }

    if (Array.isArray(element.children)) {
      stripPrefix(element.children, rootSelector);
    }
  }
}

/**
 * Stylis middleware that canonicalizes `@scope` rules.
 *
 * 1. Inserts `(rootSelector)` into the `@scope` prelude — source emits @scope to (.b){…}` and we rewrite to
 *    `@scope (rootSelector) to (.b){…}`.
 * 2. Strips the `${rootSelector} ` prefix that stylis prepends to descendants of `@scope` via CSS Nesting
 *    (`.X :scope` → `:scope`).
 * 3. Hoists conditional at-rule children of `@scope` (`@media`, `@supports`, `@layer`, `@container`) so they wrap
 *    a clone of `@scope` instead of nesting inside. This keeps `@scope` innermost regardless of authoring order.
 */
export function scopePlugin(rootSelector: string): Middleware {
  const insertion = `(${rootSelector}) `;

  return (element, _index, siblings) => {
    if (element.type !== SCOPE || !Array.isArray(element.children)) {
      return;
    }

    // Clones inherit the modified prelude, so skip the rewrite when re-entered for a sibling we just produced.
    if (typeof element.value === 'string' && element.value.indexOf(insertion) === -1) {
      element.value = `${SCOPE} ${insertion}${element.value.slice(SCOPE.length + 1)}`;

      stripPrefix(element.children, rootSelector);
    }

    // Pull conditional at-rule children out and reuse each as a sibling wrapper around a clone of `@scope`.
    const inner: Element[] = [];
    const hoisted: Element[] = [];

    for (const child of element.children) {
      if (isHoistableAtRule(child)) {
        hoisted.push(child);
        continue;
      }

      inner.push(child);
    }

    if (hoisted.length === 0) {
      return;
    }

    element.children = inner;

    for (const atRule of hoisted) {
      siblings.push(hoistOutOfScope(element, atRule));
    }
  };
}
