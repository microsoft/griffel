import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DefaultMessage } from './DefaultMessage';
import { FlattenView } from './FlattenView';
import { useMakeStylesState } from './useMakeStylesState';

const DevTools: React.FC = () => {
  const state = useMakeStylesState();

  if (state && Object.keys(state).length > 0) {
    return <FlattenView debugResultRoot={state} />;
  }

  return <DefaultMessage />;
};

ReactDOM.render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>,
  document.getElementById('root'),
);
