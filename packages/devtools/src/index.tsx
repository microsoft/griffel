import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useMakeStylesState } from './useMakeStylesState';

const DevTools: React.FC = () => {
  const state = useMakeStylesState();

  return <div>{JSON.stringify(state)}</div>;
};

ReactDOM.render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>,
  document.getElementById('root'),
);
