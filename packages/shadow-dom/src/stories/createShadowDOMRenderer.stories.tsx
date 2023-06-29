import * as React from 'react';
// @ts-expect-error Typings are missing
import { createProxy as _createProxy, default as _root } from 'react-shadow';

import { makeStyles, RendererProvider, shorthands } from '@griffel/react';
import { createShadowDOMRenderer } from '../../src';

type Root = typeof _root;

type CreateProxyRenderFn = ({ children }: { children: React.ReactNode; root: ShadowRoot }) => React.ReactNode;
type CreateProxyFn = (target: unknown, id: string, render: CreateProxyRenderFn) => Root;

const createProxy: CreateProxyFn = _createProxy;

const ReactComponentsWrapper: React.FC<{
  children: React.ReactNode;
  root: ShadowRoot;
}> = ({ children, root }) => {
  const renderer = React.useMemo(() => createShadowDOMRenderer(root), [root]);

  React.useLayoutEffect(() => {
    if (renderer.adoptedStyleSheets && renderer.adoptedStyleSheets.length > 0) {
      if (root.adoptedStyleSheets.find(styleSheet => styleSheet === renderer.adoptedStyleSheets[0])) {
        return;
      }

      root.adoptedStyleSheets = [...root.adoptedStyleSheets, ...renderer.adoptedStyleSheets];
    }
  }, [renderer.adoptedStyleSheets, root.adoptedStyleSheets]);

  return <RendererProvider renderer={renderer}>{children}</RendererProvider>;
};

const root = createProxy({}, '@griffel/shadow-dom', ({ children, root }) => (
  <ReactComponentsWrapper root={root}>{children}</ReactComponentsWrapper>
));

const useStyles = makeStyles({
  root: {
    color: 'black',
    ...shorthands.borderRadius('5px'),
    ...shorthands.padding('10px'),
    ...shorthands.border('3px', 'dotted', 'magenta'),
    width: '300px',
  },
  button: {
    ...shorthands.borderRadius('5px'),
    ...shorthands.padding('5px'),
    ...shorthands.border('2px', 'solid', 'black'),
    backgroundColor: 'white',
  },
  p: {
    marginTop: 0,
    fontSize: '18px',
  },
});

const ExampleComponent: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <p className={classes.p}>Hello world!</p>
      <button className={classes.button}>Click me</button>
    </div>
  );
};

export const CreateShadowDOMRenderer = () => {
  return (
    <root.div>
      <ExampleComponent />
    </root.div>
  );
};
