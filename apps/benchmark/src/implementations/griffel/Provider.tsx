import { createDOMRenderer } from '@griffel/core';
import { RendererProvider } from '@griffel/react';
import React from 'react';

const renderer = createDOMRenderer(document);

/**
 * The benchmarking app already uses Griffel, no need for an extra provider here.
 */
const GriffelProvider: React.FC = ({ children }) => {
  return <RendererProvider renderer={renderer}>{children}</RendererProvider>;
};

export default GriffelProvider;
