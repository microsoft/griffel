/*
 * @vitest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { describe, it, expect } from 'vitest';
import { createDOMRenderer } from '@griffel/core';
import * as prettier from 'prettier';
import type * as React from 'react';
import * as ReactDOM from 'react-dom/server';

import { makeStyles } from './makeStyles.js';
import { makeResetStyles } from './makeResetStyles.js';
import { RendererProvider } from './RendererContext.js';
import { renderToStyleElements } from './renderToStyleElements.js';

async function formatHtml(value: string) {
  return (await prettier.format(value, { parser: 'html' })).trim();
}

describe('renderToStyleElements (node)', () => {
  describe('makeStyles', () => {
    it('supports overrides', async () => {
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

      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
        "<style
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
          .f14hep94:hover {
            color: pink;
          }
        </style>"
      `);
    });

    it('supports overrides', async () => {
      const useExampleStylesA = makeStyles({
        root: {
          paddingLeft: '10px',
          margin: '10px',
          ':hover': { paddingRight: '20px' },
        },
      });
      const useExampleStylesB = makeStyles({
        root: { padding: '10px', ':hover': { padding: '20px' } },
      });
      const useExampleStylesC = makeStyles({
        root: { marginLeft: '10px' },
      });
      const ExampleComponent: React.FC = () => {
        useExampleStylesA();
        useExampleStylesB();
        useExampleStylesC();

        return null;
      };

      const renderer = createDOMRenderer();

      ReactDOM.renderToStaticMarkup(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );

      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
        "<style
          data-make-styles-bucket="d"
          data-priority="-1"
          data-make-styles-rehydration="true"
        >
          .femlv54 {
            margin: 10px;
          }
          .fbhmu18 {
            padding: 10px;
          }</style
        ><style
          data-make-styles-bucket="d"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          .frdkuqy {
            padding-left: 10px;
          }
          .f81rol6 {
            padding-right: 10px;
          }
          .f1oou7ox {
            margin-left: 10px;
          }
          .f1pxv85q {
            margin-right: 10px;
          }</style
        ><style
          data-make-styles-bucket="h"
          data-priority="-1"
          data-make-styles-rehydration="true"
        >
          .fp9hkdp:hover {
            padding: 20px;
          }</style
        ><style
          data-make-styles-bucket="h"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          .f19vcps:hover {
            padding-right: 20px;
          }
          .f1mr755h:hover {
            padding-left: 20px;
          }
        </style>"
      `);
    });

    it('handles @at rules', async () => {
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

      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
        "<style
          data-make-styles-bucket="t"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @supports (display: grid) {
            .fo1gfrc {
              color: red;
            }
          }</style
        ><style
          media="screen and (max-width: 992px)"
          data-make-styles-bucket="m"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @media screen and (max-width: 992px) {
            .fzd6x39:hover {
              color: blue;
            }
          }
        </style>"
      `);
    });

    it('handles media query order', async () => {
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

      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
        "<style
          data-make-styles-bucket="d"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          .fe3e8s9 {
            color: red;
          }</style
        ><style
          data-make-styles-bucket="t"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @supports (display: grid) {
            .fui0tgz {
              color: green;
            }
          }</style
        ><style
          media="(max-width: 1px)"
          data-make-styles-bucket="m"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @media (max-width: 1px) {
            .f13d6lhy:hover {
              color: blue;
            }
          }</style
        ><style
          media="(max-width: 2px)"
          data-make-styles-bucket="m"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @media (max-width: 2px) {
            .f1b07yzi:hover {
              color: blue;
            }
          }</style
        ><style
          media="(max-width: 3px)"
          data-make-styles-bucket="m"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @media (max-width: 3px) {
            .f1cy3850:hover {
              color: blue;
            }
          }</style
        ><style
          media="(max-width: 4px)"
          data-make-styles-bucket="m"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @media (max-width: 4px) {
            .fyvg8w:hover {
              color: blue;
            }
          }
        </style>"
      `);
    });

    it('handles container query order', async () => {
      const useExampleStyles = makeStyles({
        container: {
          color: 'red',
          '@container (max-width: 4px)': {
            ':hover': { color: 'blue' },
          },
          '@container (max-width: 2px)': {
            ':hover': { color: 'blue' },
          },
          '@supports (display: grid)': {
            color: 'green',
          },
          '@container (max-width: 3px)': {
            ':hover': { color: 'blue' },
          },
          '@container (max-width: 1px)': {
            ':hover': { color: 'blue' },
          },
        },
      });
      const ExampleComponent: React.FC = () => {
        const classes = useExampleStyles();

        return <div className={classes.container} />;
      };

      const containerQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)', '(max-width: 4px)'];
      const renderer = createDOMRenderer(undefined, {
        compareContainerQueries(a, b) {
          return containerQueryOrder.indexOf(a) - containerQueryOrder.indexOf(b);
        },
      });

      ReactDOM.renderToStaticMarkup(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );

      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
          "<style
            data-make-styles-bucket="d"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            .fe3e8s9 {
              color: red;
            }</style
          ><style
            data-make-styles-bucket="t"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            @supports (display: grid) {
              .fui0tgz {
                color: green;
              }
            }</style
          ><style
            data-container="(max-width: 1px)"
            data-make-styles-bucket="x"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            @container (max-width: 1px) {
              .f1hcgzak:hover {
                color: blue;
              }
            }</style
          ><style
            data-container="(max-width: 2px)"
            data-make-styles-bucket="x"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            @container (max-width: 2px) {
              .f91jd4g:hover {
                color: blue;
              }
            }</style
          ><style
            data-container="(max-width: 3px)"
            data-make-styles-bucket="x"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            @container (max-width: 3px) {
              .f1bnta4m:hover {
                color: blue;
              }
            }</style
          ><style
            data-container="(max-width: 4px)"
            data-make-styles-bucket="x"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            @container (max-width: 4px) {
              .f17ei21x:hover {
                color: blue;
              }
            }
          </style>"
        `);
    });

    it('handles combined media and container query order', async () => {
      const useExampleStyles = makeStyles({
        combined: {
          color: 'red',
          '@media (max-width: 2px)': {
            ':hover': { color: 'blue' },
          },
          '@media (max-width: 1px)': {
            ':hover': { color: 'blue', paddingLeft: '1px' },
          },
          '@container (max-width: 2px)': {
            ':hover': { color: 'green' },
          },
          '@container (max-width: 1px)': {
            ':hover': { color: 'green' },
          },
        },
      });
      const ExampleComponent: React.FC = () => {
        const classes = useExampleStyles();

        return <div className={classes.combined} />;
      };

      const queryOrder = ['(max-width: 1px)', '(max-width: 2px)'];
      const renderer = createDOMRenderer(undefined, {
        compareMediaQueries(a, b) {
          return queryOrder.indexOf(a) - queryOrder.indexOf(b);
        },
        compareContainerQueries(a, b) {
          return queryOrder.indexOf(a) - queryOrder.indexOf(b);
        },
      });

      ReactDOM.renderToStaticMarkup(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );

      // "@media" sheets ("m" bucket) must come before "@container" sheets ("x" bucket) and never
      // interleave, while each condition is ordered by its own comparator.
      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
        "<style
          data-make-styles-bucket="d"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          .fe3e8s9 {
            color: red;
          }</style
        ><style
          media="(max-width: 1px)"
          data-make-styles-bucket="m"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @media (max-width: 1px) {
            .f13d6lhy:hover {
              color: blue;
            }
          }
          @media (max-width: 1px) {
            .f523lep:hover {
              padding-right: 1px;
            }
            .fy5b5hz:hover {
              padding-left: 1px;
            }
          }</style
        ><style
          media="(max-width: 2px)"
          data-make-styles-bucket="m"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @media (max-width: 2px) {
            .f1b07yzi:hover {
              color: blue;
            }
          }</style
        ><style
          data-container="(max-width: 1px)"
          data-make-styles-bucket="x"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @container (max-width: 1px) {
            .f1gbmdl9:hover {
              color: green;
            }
          }</style
        ><style
          data-container="(max-width: 2px)"
          data-make-styles-bucket="x"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          @container (max-width: 2px) {
            .f1gqh46w:hover {
              color: green;
            }
          }
        </style>"
      `);
    });

    it('keeps container queries after regular styles and media with a "min-width" comparator', async () => {
      // Regression: a realistic comparator that parses "min-width" (and pushes conditions without one
      // to the end) must not hoist "@container" sheets above regular styles. Bucket order has to win
      // over the condition comparator, otherwise container queries get scattered to the top of the
      // output and are overridden by regular styles.
      const useExampleStyles = makeStyles({
        combined: {
          color: 'black',
          '@media (min-width: 480px)': {
            ':hover': { color: 'red' },
          },
          '@container (min-width: 720px)': {
            ':hover': { color: 'blue' },
          },
          '@container (min-width: 480px)': {
            ':hover': { color: 'green' },
          },
        },
      });
      const ExampleComponent: React.FC = () => {
        const classes = useExampleStyles();

        return <div className={classes.combined} />;
      };

      const NO_MIN_WIDTH = Number.MAX_SAFE_INTEGER;
      const parseMinWidth = (query: string) => {
        const match = /min-width:\s*(\d+)/.exec(query);
        return match ? Number(match[1]) : NO_MIN_WIDTH;
      };
      const renderer = createDOMRenderer(undefined, {
        compareMediaQueries(a, b) {
          return parseMinWidth(a) - parseMinWidth(b);
        },
        compareContainerQueries(a, b) {
          return parseMinWidth(a) - parseMinWidth(b);
        },
      });

      ReactDOM.renderToStaticMarkup(
        <RendererProvider renderer={renderer}>
          <ExampleComponent />
        </RendererProvider>,
      );

      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
          "<style
            data-make-styles-bucket="d"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            .f1o4jmwm {
              color: black;
            }</style
          ><style
            media="(min-width: 480px)"
            data-make-styles-bucket="m"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            @media (min-width: 480px) {
              .fod6qbx:hover {
                color: red;
              }
            }</style
          ><style
            data-container="(min-width: 480px)"
            data-make-styles-bucket="x"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            @container (min-width: 480px) {
              .fa2bp0w:hover {
                color: green;
              }
            }</style
          ><style
            data-container="(min-width: 720px)"
            data-make-styles-bucket="x"
            data-priority="0"
            data-make-styles-rehydration="true"
          >
            @container (min-width: 720px) {
              .f138pnqb:hover {
                color: blue;
              }
            }
          </style>"
        `);
    });

    it('handles keyframes', async () => {
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

      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
        "<style
          data-make-styles-bucket="d"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
          .f1g6ul6r {
            animation-name: f1q8eu9e;
          }
          .f1fp4ujf {
            animation-name: f55c0se;
          }</style
        ><style
          data-make-styles-bucket="k"
          data-priority="0"
          data-make-styles-rehydration="true"
        >
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
        </style>"
      `);
    });
  });

  describe('makeResetStyles', () => {
    it('renders styles', async () => {
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

      expect(await formatHtml(ReactDOM.renderToStaticMarkup(<>{renderToStyleElements(renderer)}</>)))
        .toMatchInlineSnapshot(`
        "<style
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
        </style>"
      `);
    });
  });
});
