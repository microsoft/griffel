import { LAYER, MEDIA, RULESET, SUPPORTS } from 'stylis';
import type { Element, Middleware } from 'stylis';

const SCOPE_TYPE = '@scope';
const CONTAINER_TYPE = '@container';

function isHoistableAtRule(element: Element): boolean {
  return (
    element.type === MEDIA || element.type === SUPPORTS || element.type === LAYER || element.type === CONTAINER_TYPE
  );
}

function stripPrefix(elements: Element[], prefix: string): void {
  for (const element of elements) {
    if (element.type === RULESET && Array.isArray(element.props)) {
      element.props = element.props.map(value => (value.startsWith(prefix) ? value.slice(prefix.length) : value));
    }
    if (Array.isArray(element.children)) {
      stripPrefix(element.children, prefix);
    }
  }
}

/**
 * Stylis middleware that canonicalizes `@scope` rules. Must run BEFORE `stringify`.
 *
 * 1. Inserts `(rootSelector)` into the `@scope` prelude — source emits
 *    `@scope to (.b){…}` and we rewrite to `@scope (rootSelector) to (.b){…}`.
 * 2. Strips the `${rootSelector} ` prefix that stylis prepends to descendants
 *    of `@scope` via CSS Nesting (`.X :scope` → `:scope`).
 * 3. Hoists conditional at-rule children of `@scope` (`@media`, `@supports`,
 *    `@layer`, `@container`) so they wrap a clone of `@scope` instead of
 *    nesting inside. This keeps `@scope` innermost regardless of authoring
 *    order.
 */
export function scopePlugin(rootSelector: string): Middleware {
  const prefix = rootSelector + ' ';
  const insertion = `(${rootSelector}) `;

  return (element, _index, siblings) => {
    if (element.type !== SCOPE_TYPE || !Array.isArray(element.children)) {
      return;
    }

    // Idempotent: clones inherit the modified prelude, so skip the rewrite
    // when re-entered for a sibling we just produced.
    if (typeof element.value === 'string' && element.value.indexOf(insertion) === -1) {
      element.value = element.value.replace(/^@scope ?/, '@scope ' + insertion);
      if (Array.isArray(element.props)) {
        element.props = element.props.map(prelude => insertion + prelude);
      }
      stripPrefix(element.children, prefix);
    }

    // Pull conditional at-rule children out and reuse each as a sibling wrapper
    // around a clone of `@scope`.
    const inner: Element[] = [];
    const hoisted: Element[] = [];
    for (const child of element.children) {
      (isHoistableAtRule(child) ? hoisted : inner).push(child);
    }
    if (hoisted.length === 0) return;

    element.children = inner;

    for (const atRule of hoisted) {
      const scopeClone: Element = { ...element, children: atRule.children, return: '', root: atRule, parent: atRule };
      atRule.children = [scopeClone];
      atRule.return = '';
      atRule.root = null;
      atRule.parent = null;
      siblings.push(atRule);
    }
  };
}
