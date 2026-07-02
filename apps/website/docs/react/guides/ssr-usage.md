---
sidebar_position: 4
---

# Server-Side Rendering

Griffel provides first class support for Server-Side Rendering.

## Next.js (Pages Router)

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

## Next.js (App Router)

The App Router streams HTML, so styles are flushed with [`useServerInsertedHTML`](https://nextjs.org/docs/app/api-reference/functions/use-server-inserted-html) instead of a custom `_document`.

### Configuring a project

1. Create a Client Component that owns the renderer and flushes its styles:

```tsx
'use client';

// highlight-next-line
import { createDOMRenderer, RendererProvider, renderToStyleElements } from '@griffel/react';
import { useServerInsertedHTML } from 'next/navigation';
import { useRef, useState } from 'react';

export function GriffelRegistry({ children }: { children: React.ReactNode }) {
  // 👇 one renderer per request, kept stable across re-renders
  const [renderer] = useState(() => createDOMRenderer());
  const didRenderRef = useRef(false);

  useServerInsertedHTML(() => {
    // highlight-start
    // 👇 Flush the collected styles exactly once. Next calls this callback once per
    // streaming flush, and renderToStyleElements() returns the renderer's ENTIRE CSS
    // every time — flushing on every call would duplicate it into <body> (see
    // "Flush the styles only once" below).
    if (didRenderRef.current) {
      return;
    }
    didRenderRef.current = true;
    // highlight-end

    return <>{renderToStyleElements(renderer)}</>;
  });

  return <RendererProvider renderer={renderer}>{children}</RendererProvider>;
}
```

2. Wrap your app with it in `app/layout.tsx`:

```tsx
import { GriffelRegistry } from './griffel-registry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GriffelRegistry>{children}</GriffelRegistry>
      </body>
    </html>
  );
}
```

3. You can now server render components with Griffel styles anywhere in the tree (Client Components, since `makeStyles` runs on the client renderer after hydration).

### Flush the styles only once

`renderToStyleElements` returns **all** the CSS the renderer has collected so far. In the Pages Router it runs once, so this is fine. In the App Router, Next calls `useServerInsertedHTML` **once per streaming flush** — so without the `didRenderRef` guard, every flush re-emits the full stylesheet and the duplicate copies are streamed into `<body>`.

Those stale `<body>` copies persist across a client-side navigation and, sitting after `<head>` at equal specificity, can override the runtime styles Griffel inserts into `<head>` afterwards — making `makeStyles` overrides lose to their `makeResetStyles` base (controls render at their default size, but only _after_ a soft navigation; a hard reload looks correct).

The `didRenderRef` guard emits the collected styles on the first flush and skips the rest, so nothing is duplicated. This is the same setup Fluent UI — which is built on Griffel — uses for the App Router.

To verify, request a page without JavaScript and confirm the `data-make-styles-rehydration` markers appear only in `<head>`, never in `<body>`.
