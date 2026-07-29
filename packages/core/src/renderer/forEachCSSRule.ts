import { compile, middleware, rulesheet, serialize, stringify } from 'stylis';

/**
 * Splits the concatenated CSS text of a Griffel `<style>` element back into the individual rule
 * strings that produced it.
 *
 * Griffel keys `renderer.insertionCache` by the **exact** rule string that `insertCSSRules()`
 * receives, so rehydration has to recover those strings byte for byte — anything else is a silent
 * cache miss that re-inserts a rule the server already sent, appending it to the end of its bucket
 * where it can start winning the cascade.
 *
 * Those rules were produced by `compile()` + `stringify()` (see `compileCSSRules()`), so running
 * the same pair over their concatenation gives them back unchanged. Reusing the parser that wrote
 * the CSS is what makes this byte-exact; hand-written matching only ever approximates it.
 *
 * `styleElement.sheet.cssRules` cannot be used instead: it exposes the browser's own serialization
 * (`.foo { color: red; }`, `from` rewritten to `0%`), which never matches Griffel's output.
 *
 * Nothing here names an at-rule, so `@media`, `@supports`, `@layer`, `@scope`, `@container`,
 * nested at-rules and any future syntax stylis learns are handled without changes.
 */
export function forEachCSSRule(cssText: string, callback: (cssRule: string) => void): void {
  serialize(
    compile(cssText),
    middleware([
      stringify,

      // 💡 the same extraction used when these rules were created: `rulesheet` reports every
      // top-level rule, which is exactly the granularity `insertionCache` is keyed at
      rulesheet(callback),
    ]),
  );
}
