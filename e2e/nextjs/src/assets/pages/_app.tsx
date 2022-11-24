import { createDOMRenderer, GriffelRenderer, RendererProvider } from '@griffel/react';
import * as React from 'react';

import type { AppProps } from 'next/app';

type EnhancedAppProps = AppProps & { renderer?: GriffelRenderer };

function MyApp({ Component, pageProps, renderer }: EnhancedAppProps) {
  return (
    <RendererProvider renderer={renderer || createDOMRenderer()}>
      <Component {...pageProps} />
    </RendererProvider>
  );
}

export default MyApp;
