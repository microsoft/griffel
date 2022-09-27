---
sidebar_position: 4
---

# Server-Side Rendering

Griffel provides first class support for Server-Side Rendering.

## Next.js

### Base setup

For basic instructions to setup Next.js, see [Getting Started](https://nextjs.org/docs/getting-started). Please complete the following steps:

1. Get a basic Next.js setup running, rendering a page from the `pages` folder, as guided by the tutorial.
2. Add the Griffel to dependencies (`@griffel/react` package), check [Install](/react/install) page.

A complete demo project is available on [CodeSandbox](https://codesandbox.io/s/next-js-project-with-griffel-react-f22mwn).

### Configuring a project

1. Create a `_document.js` file under your `pages` folder with the following content:

```jsx
// highlight-next-line
import { createDOMRenderer, renderToStyleElements } from '@griffel/react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // highlight-start
    // 👇 creates a renderer
    const renderer = createDOMRenderer();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => props => <App {...props} renderer={renderer} />,
      });
    // highlight-end

    const initialProps = await Document.getInitialProps(ctx);
    // highlight-start
    const styles = renderToStyleElements(renderer);

    return {
      ...initialProps,
      // 👇 adding our styles elements to output
      styles: [...initialProps.styles, ...styles],
    };
    // highlight-end
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

2. Create or modify an `_app.js` file under your `pages` folder with the following content:

```js
import { createDOMRenderer, RendererProvider } from '@griffel/react';

function MyApp({ Component, pageProps, renderer }) {
  return (
    // 👇 accepts a renderer passed from the <Document /> component or creates a default one
    <RendererProvider renderer={renderer || createDOMRenderer()}>
      <Component {...pageProps} />
    </RendererProvider>
  );
}

export default MyApp;
```

3. You should now be able to server render components with Griffel styles on any of your pages:

```js
import { makeStyles } from '@griffel/react';

const useClasses = makeStyles({
  button: { fontWeight: 'bold' },
});

export default function Home() {
  const classes = useClasses();

  return <Button className={classes.button}>Hello world!</Button>;
}
```
