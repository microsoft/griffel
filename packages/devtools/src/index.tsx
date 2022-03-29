import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { makeStyles } from '@griffel/react';

import { DARK_THEME_COLOR_TOKENS, LIGHT_THEME_COLOR_TOKENS } from './colorTokens';
import { DefaultMessage } from './DefaultMessage';
import { FlattenView } from './FlattenView';
import { ThemeContext } from './ThemeContext';
import { useMakeStylesState } from './useMakeStylesState';

const useStyles = makeStyles({
  root: {
    color: LIGHT_THEME_COLOR_TOKENS.foreground,
    backgroundColor: LIGHT_THEME_COLOR_TOKENS.background,
  },
  rootDark: {
    color: DARK_THEME_COLOR_TOKENS.foreground,
    backgroundColor: DARK_THEME_COLOR_TOKENS.background,
  },
});

const DevTools: React.FC = () => {
  const state = useMakeStylesState();

  const classes = useStyles();
  const browserTheme = chrome.devtools?.panels?.themeName === 'dark' ? 'dark' : 'light';

  React.useLayoutEffect(() => {
    if (browserTheme === 'dark') {
      document.body.classList.add(...classes.rootDark.split(' '));
    } else {
      document.body.classList.add(...classes.root.split(' '));
    }
  }, []);

  let children = <DefaultMessage />;
  if (state && Object.keys(state).length > 0) {
    children = <FlattenView debugResultRoot={state} />;
  }

  return <ThemeContext.Provider value={browserTheme}>{children}</ThemeContext.Provider>;
};

ReactDOM.render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>,
  document.getElementById('root'),
);
