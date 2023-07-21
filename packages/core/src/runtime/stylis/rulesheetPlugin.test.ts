import { compile, middleware, serialize, stringify, RULESET } from 'stylis';

import { rulesheetPlugin } from './rulesheetPlugin';
import type { RulesheetPluginCallback } from './rulesheetPlugin';

function compileRule(rule: string, callback: RulesheetPluginCallback) {
  return serialize(compile(rule), middleware([stringify, rulesheetPlugin(callback)]));
}

describe('rulesheetPlugin', () => {
  it('handles basic selectors', () => {
    const callback = jest.fn();
    const css = `
      .foo { color: red }
      .bar { color: blue }
    `;

    expect(compileRule(css, callback)).toMatchInlineSnapshot(`".foo{color:red;}.bar{color:blue;}"`);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: RULESET, return: '.foo{color:red;}' }),
      '.foo{color:red;}',
    );
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: RULESET, return: '.bar{color:blue;}' }),
      '.bar{color:blue;}',
    );
  });
});
