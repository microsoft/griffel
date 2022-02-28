---
sidebar_position: 4
---

# Server-Side Rendering

Griffel fully supports Server-Side Rendering.

## Next.js

### Base setup

For basic instructions on getting Next.js set up, see [Getting Started](https://nextjs.org/docs/getting-started). Please complete following steps:

1. Get a basic Next.js setup running, rendering a page from the `pages` folder, as guided by the tutorial.
2. Add the Griffel to dependencies (`@griffel/react` package`), check [Install](/react/install) page.

A complete demo project is available on [CodeSandbox](https://codesandbox.io/s/next-js-project-with-griffel-react-f22mwn).

### Configuring a project

1. Create a `_document.js` file under your `pages` folder with the following content:

```tsx
import { createDOMRenderer, renderToStyleElements } from '@griffel/react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // 👇 creates a renderer
    const renderer = createDOMRenderer();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        // 👇 this is required by pass the same instance to <App />
        enhanceApp: App => props => <App {...props} renderer={renderer} />,
      });

    const initialProps = await Document.getInitialProps(ctx);
    const styles = renderToStyleElements(renderer);

    return {
      ...initialProps,
      // 👇 adding our styles elements to output
      styles: [...initialProps.styles, ...styles],
    };
  }

  render() {
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
```

2. Create or modify a `_app.js` file under your `pages` folder with the following content:

```js
import { createDOMRenderer, RendererProvider } from '@griffel/react';

function MyApp({ Component, pageProps, renderer }) {
  return (
    // 👇 accepts a renderer passed from <Document /> component or creates a default one
    <RendererProvider renderer={renderer || createDOMRenderer()}>
      <Component {...pageProps} />
    </RendererProvider>
  );
}

export default MyApp;
```

3. You should now be able to server render components with Griffel styles in any of your pages:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  button: { fontWeight: 'bold' },
});

export default function Home() {
  const classes = useClasses();

  return <Button classeName={classes.button}>Hello world!</Button>;
}
```
