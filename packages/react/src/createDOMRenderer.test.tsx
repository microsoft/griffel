import { createDOMRenderer, mergeClasses } from '@griffel/core';
import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';

import { makeStyles } from './makeStyles';
import { makeResetStyles } from './makeResetStyles';
import { RendererProvider } from './RendererContext';
import { renderToStyleElements } from './renderToStyleElements';
import { useInsertionEffect as _useInsertionEffect } from './useInsertionEffect';

jest.mock('./useInsertionEffect', () => ({
  useInsertionEffect: jest.fn(),
}));

const useInsertionEffect = _useInsertionEffect as jest.MockedFunction<typeof React.useInsertionEffect>;

describe('createDOMRenderer', () => {
  it('rehydrateCache() avoids double insertion', () => {
    // This test validates a scenario for Server-Side rendering

    const clientRenderer = createDOMRenderer(document);
    const serverRenderer = createDOMRenderer(
      // we should use "null" as "undefined" will fall back to "document" which is present in this environment
      null as unknown as undefined,
    );

    const useExampleClasses = makeStyles({
      root: {
        animationName: {
          from: { height: '10px' },
          to: { height: '20px' },
        },

        color: 'red',
        '@media screen and (max-width: 992px)': { ':hover': { color: 'blue' } },
      },
    });
    const useExampleClass = makeResetStyles({
      color: 'red',
      ':hover': { color: 'blue' },
    });
    const ExampleComponent: React.FC = () => {
      const classes = useExampleClasses();
      const className = useExampleClass();

      return <div className={mergeClasses(className, classes.root)} />;
    };

    //
    // Server
    // A "server" renders components to static HTML that will be transferred to a client
    //

    // Heads up!
    // Mock there is need as this test is executed in DOM environment and uses "useInsertionEffect".
    // However, "useInsertionEffect" will not be called in "renderToStaticMarkup()".
    useInsertionEffect.mockImplementation(fn => fn());

    const componentHTML = renderToStaticMarkup(
      <RendererProvider renderer={serverRenderer}>
        <ExampleComponent />
      </RendererProvider>,
    );
    const stylesHTML = renderToStaticMarkup(<>{renderToStyleElements(serverRenderer)}</>);

    useInsertionEffect.mockImplementation(React.useInsertionEffect);

    // Ensure that all styles are inserted into the cache
    expect(serverRenderer.insertionCache).toMatchInlineSnapshot(`
      Object {
        ".f1p9cr64{animation-name:f1kgwxhb;}": "d",
        ".fe3e8s9{color:red;}": "d",
        ".rp2atum:hover{color:blue;}": "r",
        ".rp2atum{color:red;}": "r",
        "@keyframes f1kgwxhb{from{height:10px;}to{height:20px;}}": "k",
        "@media screen and (max-width: 992px){.fzd6x39:hover{color:blue;}}": "m",
      }
    `);
    // There is no DOM on a server, style nodes should not be present
    expect(document.querySelector('style')).toBe(null);

    //
    // Client
    // Creates an element to render components and inserts HTML rendered from a server
    //

    const container = document.createElement('div');

    document.body.appendChild(container);

    container.innerHTML = componentHTML;
    document.head.innerHTML = stylesHTML;

    // As all style came from a server, we should not insert any CSS on a client
    // (this tests internal implementation, but there is no other way?)
    const styleElementsBeforeHydration = document.querySelectorAll<HTMLStyleElement>('style');
    const insertRules = [...(styleElementsBeforeHydration as unknown as HTMLStyleElement[])].map(styleEl =>
      jest.spyOn(styleEl.sheet!, 'insertRule'),
    );

    React.act(() => {
      hydrateRoot(
        container,
        // "RendererProvider" is not required there, we need it only for Jest spies
        <RendererProvider renderer={clientRenderer}>
          <ExampleComponent />
        </RendererProvider>,
      );
    });

    const styleElementsAfterHydration = document.querySelectorAll<HTMLStyleElement>('style');

    // We also would to ensure that new elements have not been inserted
    expect(styleElementsBeforeHydration.length).toBe(styleElementsAfterHydration.length);

    // Following rules are present in cache:
    // - makeResetStyles
    //   - color
    //   - :hover + color
    // - makeStyles
    //   - "animationName"
    //   - "color"
    //   - @keyframes
    //   - @media
    expect(Object.keys(clientRenderer.insertionCache)).toHaveLength(6);
    insertRules.forEach(insertRule => {
      expect(insertRule).not.toHaveBeenCalled();
    });
  });
});
