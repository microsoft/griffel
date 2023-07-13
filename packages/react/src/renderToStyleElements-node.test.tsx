/*
 * @jest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { createDOMRenderer } from '@griffel/core';
import * as prettier from 'prettier';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';

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

describe('renderToStyleElements (node)', () => {
  describe('makeStyles', () => {
    it('supports overrides', () => {
      const useExampleStyles = makeStyles({
        root: {
          color: 'red',
          ':hover': { color: 'pink' },
        },
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
                .f14hep94:hover {
                  color: pink;
                }
              </style>
          `);
    });

    it('handles @at rules', () => {
      const useExampleStyles = makeStyles({
        media: {
          '@media screen and (max-width: 992px)': {
            ':hover': { color: 'blue' },
          },
        },

        support: {
          '@supports (display: grid)': {
            color: 'red',
          },
        },
      });
      const ExampleComponent: React.FC = () => {
        const classes = useExampleStyles();

        return (
          <>
            <div className={classes.media} />
            <div className={classes.support} />
          </>
        );
      };

      const renderer = createDOMRenderer();

      ReactDOM.renderToStaticMarkup(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );

      expect(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)).toMatchInlineSnapshot(`
              <style data-make-styles-bucket="t" data-make-styles-rehydration="true">
                @supports (display: grid) {
                  .f1ofq0jl {
                    color: red;
                  }
                }</style
              ><style
                media="screen and (max-width: 992px)"
                data-make-styles-bucket="m"
                data-make-styles-rehydration="true"
              >
                @media screen and (max-width: 992px) {
                  .fnao3vb:hover {
                    color: blue;
                  }
                }
              </style>
          `);
    });

    it('handles media query order', () => {
      const useExampleStyles = makeStyles({
        media: {
          color: 'red',
          '@media (max-width: 4px)': {
            ':hover': { color: 'blue' },
          },
          '@media (max-width: 2px)': {
            ':hover': { color: 'blue' },
          },
          '@supports (display: grid)': {
            color: 'green',
          },
          '@media (max-width: 3px)': {
            ':hover': { color: 'blue' },
          },
          '@media (max-width: 1px)': {
            ':hover': { color: 'blue' },
          },
        },
      });
      const ExampleComponent: React.FC = () => {
        const classes = useExampleStyles();

        return <div className={classes.media} />;
      };

      const mediaQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)', '(max-width: 4px)'];
      const renderer = createDOMRenderer(undefined, {
        compareMediaQueries(a, b) {
          return mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);
        },
      });

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
              ><style data-make-styles-bucket="t" data-make-styles-rehydration="true">
                @supports (display: grid) {
                  .f1vq01kz {
                    color: green;
                  }
                }</style
              ><style
                media="(max-width: 1px)"
                data-make-styles-bucket="m"
                data-make-styles-rehydration="true"
              >
                @media (max-width: 1px) {
                  .f1f7njb2:hover {
                    color: blue;
                  }
                }</style
              ><style
                media="(max-width: 2px)"
                data-make-styles-bucket="m"
                data-make-styles-rehydration="true"
              >
                @media (max-width: 2px) {
                  .f1c6999y:hover {
                    color: blue;
                  }
                }</style
              ><style
                media="(max-width: 3px)"
                data-make-styles-bucket="m"
                data-make-styles-rehydration="true"
              >
                @media (max-width: 3px) {
                  .f1qdcc3n:hover {
                    color: blue;
                  }
                }</style
              ><style
                media="(max-width: 4px)"
                data-make-styles-bucket="m"
                data-make-styles-rehydration="true"
              >
                @media (max-width: 4px) {
                  .f1b4up97:hover {
                    color: blue;
                  }
                }
              </style>
          `);
    });

    it('handles keyframes', () => {
      const useExampleStyles = makeStyles({
        keyframe: {
          animationName: {
            from: {
              transform: 'rotate(0deg)',
            },
            to: {
              transform: 'rotate(360deg)',
            },
          },
        },
      });
      const ExampleComponent: React.FC = () => {
        const classes = useExampleStyles();

        return <div className={classes.keyframe} />;
      };

      const renderer = createDOMRenderer();

      ReactDOM.renderToStaticMarkup(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );

      expect(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)).toMatchInlineSnapshot(`
              <style data-make-styles-bucket="d" data-make-styles-rehydration="true">
                .f1g6ul6r {
                  animation-name: f1q8eu9e;
                }
                .f1fp4ujf {
                  animation-name: f55c0se;
                }</style
              ><style data-make-styles-bucket="k" data-make-styles-rehydration="true">
                @keyframes f1q8eu9e {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg);
                  }
                }
                @keyframes f55c0se {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(-360deg);
                  }
                }
              </style>
          `);
    });
  });

  describe('makeResetStyles', () => {
    it('renders styles', () => {
      const useClassName = makeResetStyles({
        color: 'red',
        ':hover': { color: 'pink' },
      });
      const ExampleComponent: React.FC = () => {
        return <div className={useClassName()} />;
      };
      const renderer = createDOMRenderer();

      ReactDOM.renderToStaticMarkup(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );

      expect(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)).toMatchInlineSnapshot(`
        <style data-make-styles-bucket="r" data-make-styles-rehydration="true">
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
});
