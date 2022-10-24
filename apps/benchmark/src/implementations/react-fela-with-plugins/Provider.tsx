import { createRenderer } from 'fela';
import embedded from 'fela-plugin-embedded';
import expandShorthand from 'fela-plugin-expand-shorthand';
import fallbackValue from 'fela-plugin-fallback-value';
import rtl from 'fela-plugin-rtl';
import prefixer from 'fela-plugin-prefixer';
import * as React from 'react';
import { RendererProvider } from 'react-fela';

import View from './View';

const renderer = createRenderer({
  plugins: [embedded(), expandShorthand(), fallbackValue(), rtl(), prefixer()],
});

const Provider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <RendererProvider renderer={renderer}>
      <View>{children}</View>
    </RendererProvider>
  );
};

export default Provider;
