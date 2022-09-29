import { compile, middleware, serialize, stringify } from 'stylis';
import { globalPlugin } from './globalPlugin';

function compileRule(rule: string) {
  return serialize(compile(rule), middleware([globalPlugin, stringify]));
}

describe('globalPlugin', () => {
  it('handles basic selectors', () => {
    expect(compileRule('.foo :global(.baz) { color: red }')).toMatchInlineSnapshot(`".baz .foo {color:red;}"`);
    expect(compileRule('.foo :global(body) { color: red }')).toMatchInlineSnapshot(`"body .foo {color:red;}"`);
  });

  it('handles multiple entries in selector', () => {
    expect(compileRule('.foo :global(.baz.qux) { color: red }')).toMatchInlineSnapshot(`".baz.qux .foo {color:red;}"`);
    expect(compileRule('.foo :global(body div) { color: red }')).toMatchInlineSnapshot(`"body div .foo {color:red;}"`);
  });

  it('handles data selectors', () => {
    expect(compileRule('.foo :global([data-global-style]) { color: red }')).toMatchInlineSnapshot(
      `"[data-global-style] .foo {color:red;}"`,
    );
  });
});
