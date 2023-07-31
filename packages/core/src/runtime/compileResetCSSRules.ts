import { compile, middleware, serialize, stringify } from 'stylis';

import { globalPlugin } from './stylis/globalPlugin';
import { isAtRuleElement } from './stylis/isAtRuleElement';
import { prefixerPlugin } from './stylis/prefixerPlugin';
import { rulesheetPlugin } from './stylis/rulesheetPlugin';

export function compileResetCSSRules(cssRules: string): [string[], string[]] {
  const rules: string[] = [];
  const atRules: string[] = [];

  serialize(
    compile(cssRules),
    middleware([
      globalPlugin,
      prefixerPlugin,
      stringify,

      // 💡 we are using `.insertRule()` API for DOM operations, which does not support
      // insertion of multiple CSS rules in a single call. `rulesheet` plugin extracts
      // individual rules to be used with this API
      rulesheetPlugin((element, rule) => {
        if (isAtRuleElement(element)) {
          atRules.push(rule);
          return;
        }

        rules.push(rule);
      }),
    ]),
  );

  return [rules, atRules];
}
