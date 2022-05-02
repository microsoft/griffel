import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DefaultMessage } from './DefaultMessage';
import { FlattenView } from './FlattenView';
import { darkTheme, lightTheme } from './themes';
import { useMakeStylesState } from './useMakeStylesState';

const DevTools: React.FC = () => {
  const state = useMakeStylesState();
  const theme = chrome.devtools?.panels?.themeName === 'dark' ? darkTheme : lightTheme;

  let children = <DefaultMessage />;

  if (state && Object.keys(state).length > 0) {
    children = <FlattenView debugResultRoot={state} />;
  }

  return (
    <div
      style={{
        ...(theme as React.CSSProperties),
        height: 'inherit',
        width: 'inherit',
      }}
    >
      {children}
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>,
  document.getElementById('root'),
);
