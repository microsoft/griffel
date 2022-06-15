import React from 'react';
import ReactDOM from 'react-dom';
import { createDOMRenderer, RendererProvider } from '@griffel/react';
import { App } from './App';
import './App.css';

ReactDOM.render(<App />, document.getElementById('root'));
