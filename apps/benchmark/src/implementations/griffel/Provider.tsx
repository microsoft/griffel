import React from 'react';

/**
 * The benchmarking app already uses Griffel, no need for an extra provider here.
 */
const GriffelProvider: React.FC = ({ children }) => {
  return <>{children}</>;
};

export default GriffelProvider;
