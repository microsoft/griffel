import { createDOMRenderer } from '@griffel/core';
import * as prettier from 'prettier';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';

import { makeStyles } from './makeStyles';
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

describe('renderToStyleElements', () => {
  it('renders elements in DOM env', () => {
    const useExampleStyles = makeStyles({
      root: { color: 'red', ':hover': { color: 'green' } },
    });
    const ExampleComponent: React.FC = () => {
      const classes = useExampleStyles();

      return <div className={classes.root} />;
    };

    const renderer = createDOMRenderer();

    ReactDOM.renderToStaticMarkup(
      <RendererProvider renderer={renderer}>
        <ExampleComponent />
      </RendererProvider>,
    );

    expect(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)).toMatchInlineSnapshot(`
      <style data-make-styles-bucket="d" data-make-styles-rehydration="true">
        .fe3e8s9 {
          color: red;
        }</style
      ><style data-make-styles-bucket="h" data-make-styles-rehydration="true">
        .f1ej289o:hover {
          color: green;
        }
      </style>
    `);
  });
});
