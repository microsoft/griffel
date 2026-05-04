import { describe, it, expect } from 'vitest';
import { compile, middleware, serialize, stringify } from 'stylis';
import { scopePlugin } from './scopePlugin.js';

function compileRule(className: string, body: string): string {
  return serialize(compile(`.${className}{${body}}`), middleware([scopePlugin(`.${className}`), stringify]));
}

describe('scopePlugin', () => {
  it('inserts the class as the @scope root', () => {
    expect(compileRule('foo', `@scope to (.boundary){:scope{color:red;}}`)).toMatchInlineSnapshot(
      `"@scope (.foo) to (.boundary){:scope{color:red;}}"`,
    );
  });

  it('strips the class prefix from @scope descendants', () => {
    expect(compileRule('foo', `@scope to (.boundary){:scope{ p{color:red;}}}`)).toMatchInlineSnapshot(
      `"@scope (.foo) to (.boundary){:scope p{color:red;}}"`,
    );
  });

  it('hoists @media out of @scope so @scope stays innermost', () => {
    expect(
      compileRule('foo', `@scope to (.boundary){:scope{@media (min-width: 768px){color:blue;}}}`),
    ).toMatchInlineSnapshot(`"@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:blue;}}}"`);
  });

  it('hoists @supports out of @scope so @scope stays innermost', () => {
    expect(
      compileRule('foo', `@scope to (.boundary){:scope{@supports (display: grid){color:green;}}}`),
    ).toMatchInlineSnapshot(`"@supports (display: grid){@scope (.foo) to (.boundary){:scope{color:green;}}}"`);
  });

  it('hoists @layer out of @scope so @scope stays innermost', () => {
    expect(compileRule('foo', `@scope to (.boundary){:scope{@layer utilities{color:purple;}}}`)).toMatchInlineSnapshot(
      `"@layer utilities{@scope (.foo) to (.boundary){:scope{color:purple;}}}"`,
    );
  });

  it('hoists @container out of @scope so @scope stays innermost', () => {
    expect(
      compileRule('foo', `@scope to (.boundary){:scope{@container (min-width: 400px){color:teal;}}}`),
    ).toMatchInlineSnapshot(`"@container (min-width: 400px){@scope (.foo) to (.boundary){:scope{color:teal;}}}"`);
  });

  it('keeps non-scope content alongside @scope rules', () => {
    expect(compileRule('foo', `color:black;@scope to (.boundary){:scope{color:red;}}`)).toMatchInlineSnapshot(
      `".foo{color:black;}@scope (.foo) to (.boundary){:scope{color:red;}}"`,
    );
  });

  it('hoists multiple at-rule children of one @scope', () => {
    expect(
      compileRule(
        'foo',
        `@scope to (.boundary){:scope{@media (min-width: 768px){color:blue;}@supports (display: grid){color:green;}}}`,
      ),
    ).toMatchInlineSnapshot(
      `"@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:blue;}}}@supports (display: grid){@scope (.foo) to (.boundary){:scope{color:green;}}}"`,
    );
  });

  it('keeps inline @scope content alongside hoisted at-rule wrapper', () => {
    expect(
      compileRule('foo', `@scope to (.boundary){:scope{color:red;@media (min-width: 768px){color:blue;}}}`),
    ).toMatchInlineSnapshot(
      `"@scope (.foo) to (.boundary){:scope{color:red;}}@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:blue;}}}"`,
    );
  });

  it('passes through @scope already nested inside an at-rule', () => {
    expect(
      compileRule('foo', `@media (min-width: 768px){@scope to (.boundary){:scope{color:blue;}}}`),
    ).toMatchInlineSnapshot(`"@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:blue;}}}"`);
  });

  it('hoists @media and @supports out of @scope (nested at-rules)', () => {
    expect(
      compileRule(
        'foo',
        `@scope to (.boundary){:scope{@media (min-width: 768px){color:red;@supports (display: grid){color:blue;}}}}`,
      ),
    ).toMatchInlineSnapshot(
      `"@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:red;}}@supports (display: grid){@scope (.foo) to (.boundary){:scope{color:blue;}}}}"`,
    );
  });

  it('processes multiple sibling @scope rules independently', () => {
    expect(
      compileRule('foo', `@scope to (.a){:scope{color:red;}}@scope to (.b){:scope{color:blue;}}`),
    ).toMatchInlineSnapshot(`"@scope (.foo) to (.a){:scope{color:red;}}@scope (.foo) to (.b){:scope{color:blue;}}"`);
  });
});
