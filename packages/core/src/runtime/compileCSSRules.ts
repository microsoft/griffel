import { compile, middleware, rulesheet, serialize, stringify } from 'stylis';

import { globalPlugin } from './stylis/globalPlugin';
import { prefixerPlugin } from './stylis/prefixerPlugin';
import { sortClassesInAtRulesPlugin } from './stylis/sortClassesInAtRulesPlugin';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export function compileCSSRules(cssRules: string, sortClassesInAtRules: boolean): string[] {
  const rules: string[] = [];

  serialize(
    compile(cssRules),
    middleware([
      globalPlugin,
      sortClassesInAtRules ? sortClassesInAtRulesPlugin : noop,
      prefixerPlugin,
      stringify,

      // 💡 we are using `.insertRule()` API for DOM operations, which does not support
      // insertion of multiple CSS rules in a single call. `rulesheet` plugin extracts
      // individual rules to be used with this API
      rulesheet(rule => rules.push(rule)),
    ]),
  );

  return rules;
}
