import { createDOMRenderer, renderToStyleElements } from '@griffel/react';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import * as React from 'react';

class MyDocument extends Document {
  static override async getInitialProps(ctx: DocumentContext) {
    // 👇 creates a renderer that will be used for SSR
    const renderer = createDOMRenderer();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App =>
          function EnhancedApp(props) {
            const enhancedProps = {
              ...props,
              // 👇 this is required to provide a proper renderer instance
              renderer,
            };

            return <App {...enhancedProps} />;
          },
      });

    const initialProps = await Document.getInitialProps(ctx);
    const styles = renderToStyleElements(renderer);

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          {/* 👇 adding Griffel styles elements to output */}
          {styles}
        </>
      ),
    };
  }

  override render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
