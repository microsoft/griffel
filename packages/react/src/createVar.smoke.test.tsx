import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createVar, makeStyles, RendererProvider, createDOMRenderer } from './index.js';

describe('createVar (public @griffel/react API)', () => {
  it('renders to string with the same var name as client-side equivalent', () => {
    const colorVar = createVar();
    const placeholder = `${colorVar}`;
    const useStyles = makeStyles({
      root: {
        [placeholder]: 'blue',
        color: `var(${placeholder})`,
      },
    });

    const Component: React.FC<{ override?: string }> = ({ override }) => {
      const classes = useStyles();
      const style = override ? { [colorVar as unknown as string]: override } : undefined;
      return <div className={classes.root} style={style} data-testid="el" />;
    };

    const serverRenderer = createDOMRenderer();
    const html = renderToString(
      <RendererProvider renderer={serverRenderer}>
        <Component override="red" />
      </RendererProvider>,
    );

    // The rendered HTML must NOT contain a placeholder.
    expect(html).not.toMatch(/--__g_var_p\d+__/);
    // The coerced var name should be --fv-… after makeStyles has run.
    expect(`${colorVar}`).toMatch(/^--fv-/);
    // The override style should carry the resolved var name.
    expect(html).toContain(`${colorVar}:red`);
  });
});
