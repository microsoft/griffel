import { compile, middleware, serialize, stringify } from 'stylis';

import { globalPlugin } from './stylis/globalPlugin.js';
import { isAtRuleElement } from './stylis/isAtRuleElement.js';
import { prefixerPlugin } from './stylis/prefixerPlugin.js';
import { rulesheetPlugin } from './stylis/rulesheetPlugin.js';
import { processScopes } from './stylis/scopePlugin.js';

export function compileResetCSSRules(className: string, body: string): [string[], string[]] {
  const rules: string[] = [];
  const atRules: string[] = [];

  const compiled = compile(`.${className}{${body}}`);
  processScopes(compiled, `.${className}`);

  serialize(
    compiled,
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
