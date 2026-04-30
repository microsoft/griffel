import { LAYER, MEDIA, RULESET, SUPPORTS } from 'stylis';
import type { Element } from 'stylis';

const SCOPE_TYPE = '@scope';
const CONTAINER_TYPE = '@container';

function isHoistableAtRule(element: Element): boolean {
  return (
    element.type === MEDIA || element.type === SUPPORTS || element.type === LAYER || element.type === CONTAINER_TYPE
  );
}

function setScopeRoot(element: Element, rootSelector: string): void {
  // element.value is `@scope to (.b)` (or `@scope` for bare). Insert the root
  // selector to produce `@scope (rootSelector) to (.b)`. Stylis stringifies
  // at-rules from `value`, but we keep `props` in sync as well.
  const insertion = `(${rootSelector}) `;
  if (typeof element.value === 'string') {
    element.value = element.value.replace(/^@scope ?/, '@scope ' + insertion);
  }
  if (Array.isArray(element.props)) {
    element.props = element.props.map(prelude => insertion + prelude);
  }
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
 * Tree pre-pass run before `serialize()` to canonicalize `@scope` rules:
 *
 * 1. Inserts the root selector into the `@scope` prelude — source emits
 *    `@scope to (.b)` and the plugin rewrites it to `@scope (rootSelector) to (.b)`.
 *
 * 2. Strips the `${rootSelector} ` prefix that stylis prepends to descendants
 *    of `@scope` (the prefix comes from CSS Nesting — `:scope` inside `.X{…}`
 *    becomes `.X :scope` after stylis hoists `@scope` out).
 *
 * 3. Hoists `@media`/`@supports`/`@layer`/`@container` children of `@scope`
 *    out so they wrap a clone of `@scope`. This makes `@scope` always the
 *    innermost conditional at-rule, regardless of authoring order.
 */
export function processScopes(elements: Element[], rootSelector: string): void {
  walk(elements, rootSelector);
}

function walk(elements: Element[], rootSelector: string): void {
  const prefix = rootSelector + ' ';

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (element.type === SCOPE_TYPE && Array.isArray(element.children)) {
      setScopeRoot(element, rootSelector);
      stripPrefix(element.children, prefix);

      const inner: Element[] = [];
      const hoisted: Element[] = [];
      for (const child of element.children) {
        (isHoistableAtRule(child) ? hoisted : inner).push(child);
      }

      if (hoisted.length > 0) {
        element.children = inner;
        const wrappers = hoisted.map(atRule => {
          const wrappedScope: Element = { ...element, children: atRule.children, parent: atRule, root: atRule };
          atRule.children = [wrappedScope];
          atRule.root = null;
          atRule.parent = null;
          return atRule;
        });
        elements.splice(i + 1, 0, ...wrappers);
        i += wrappers.length;
      }
    } else if (Array.isArray(element.children)) {
      walk(element.children, rootSelector);
    }
  }
}
