import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DefaultMessage } from './DefaultMessage';
import { useMakeStylesState } from './useMakeStylesState';

const DevTools: React.FC = () => {
  const state = useMakeStylesState();

  if (state) {
    console.log(state);
  }

  return <DefaultMessage />;
};

ReactDOM.render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>,
  document.getElementById('root'),
);
