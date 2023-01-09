import React from 'react';

const InlineStylesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default InlineStylesProvider;
