import type { GriffelRenderer } from '@griffel/core';
import { createDOMRenderer } from '@griffel/core';
import * as prettier from 'prettier';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';

import { makeStyles } from './makeStyles';
import { makeResetStyles } from './makeResetStyles';
import { RendererProvider } from './RendererContext';
import { renderToStyleElements } from './renderToStyleElements';

expect.addSnapshotSerializer({
  test(value) {
    return typeof value === 'string';
  },
  print(value) {
    /**
     * test function makes sure that value is the guarded type
     */
    const _value = value as string;

    return prettier.format(_value, { parser: 'html' }).trim();
  },
});

describe('renderToStyleElements (DOM)', () => {
  let renderer: GriffelRenderer;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    renderer = createDOMRenderer(document);
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('makeStyles', () => {
    const useExampleStyles = makeStyles({
      root: { color: 'red', ':hover': { color: 'green' } },
    });
    const ExampleComponent: React.FC = () => {
      const classes = useExampleStyles();

      return <div className={classes.root} />;
    };
    const root = createRoot(document.createElement('div'));

    React.act(() => {
      root.render(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );
    });

    expect(renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)).toMatchInlineSnapshot(`
      <style
        data-make-styles-bucket="d"
        data-priority="0"
        data-make-styles-rehydration="true"
      >
        .fe3e8s9 {
          color: red;
        }</style
      ><style
        data-make-styles-bucket="h"
        data-priority="0"
        data-make-styles-rehydration="true"
      >
        .f1ej289o:hover {
          color: green;
        }
      </style>
    `);
  });

  it('makeResetStyles', () => {
    const useClassName = makeResetStyles({
      color: 'red',
      ':hover': { color: 'pink' },
    });
    const ExampleComponent: React.FC = () => {
      return <div className={useClassName()} />;
    };
    const root = createRoot(document.createElement('div'));

    React.act(() => {
      root.render(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );
    });

    expect(renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)).toMatchInlineSnapshot(`
      <style
        data-make-styles-bucket="r"
        data-priority="0"
        data-make-styles-rehydration="true"
      >
        .r1tsu58y {
          color: red;
        }
        .r1tsu58y:hover {
          color: pink;
        }
      </style>
    `);
  });
});
