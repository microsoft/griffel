import * as React from 'react';
import { createProxy } from 'react-shadow';

import { makeStyles, RendererProvider, shorthands } from '@griffel/react';
import { createShadowDOMRenderer } from '../../src/index.js';

function adoptStyleSheets(target: ShadowRoot, sheets: readonly CSSStyleSheet[]): void {
  if (sheets.length === 0 || target.adoptedStyleSheets.includes(sheets[0])) {
    return;
  }
  target.adoptedStyleSheets = [...target.adoptedStyleSheets, ...sheets];
}

const ReactComponentsWrapper: React.FC<{
  children: React.ReactNode;
  root: ShadowRoot;
}> = ({ children, root }) => {
  const renderer = React.useMemo(() => createShadowDOMRenderer(root), [root]);

  React.useLayoutEffect(() => {
    if (renderer.adoptedStyleSheets) {
      adoptStyleSheets(root, renderer.adoptedStyleSheets);
    }
  }, [renderer.adoptedStyleSheets, root]);

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

export default {
  title: 'createShadowDOMRenderer()',
};
