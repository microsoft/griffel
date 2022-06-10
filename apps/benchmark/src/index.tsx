import React from 'react';
import ReactDOM from 'react-dom';
import { createDOMRenderer, RendererProvider } from '@griffel/react';
import { App } from './App';

const renderer = createDOMRenderer(document);

ReactDOM.render(
  <RendererProvider renderer={renderer}>
    <App />
  </RendererProvider>,
  document.getElementById('root'),
);
