import * as React from 'react';
import * as ReactDOM from 'react-dom';

const DevTools: React.FC = () => {
  return <div>hi amber</div>;
};

ReactDOM.render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>,
  document.getElementById('root'),
);
