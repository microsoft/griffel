import { useMemo } from 'react';

import { makeStyles, createDOMRenderer, RendererProvider } from '../../src/index.js';
import { compareContainerQueries } from '@griffel/utils';

// A resizable container. "container-type: inline-size" + "container-name" make it a query container
// so the "@container slot-container (...)" rules below resolve against ITS width (drag the corner).
const useContainerStyles = makeStyles({
  container: {
    containerType: 'inline-size',
    containerName: 'slot-container',

    overflow: 'auto',
    resize: 'horizontal',
    width: '320px',
    minWidth: '200px',
    maxWidth: '100%',
    padding: '16px',
    border: '2px dashed #888',
    borderRadius: '8px',
    boxSizing: 'border-box',
  },
});

// The repro: mobile-first "min-width" rules on the SAME property, authored in a deliberately shuffled
// order. The "c" bucket is split per-condition and ordered by the renderer's container comparator, so
// the highest matching breakpoint wins regardless of source order (before the fix this depended on
// global atomic insertion order — nondeterministic across builds).
const useBoxStyles = makeStyles({
  box: {
    marginLeft: '0px',
    backgroundColor: '#c8e6c9',
    padding: '12px',
    borderRadius: '6px',
    transition: 'margin-left 120ms ease, background-color 120ms ease',

    '@container slot-container (min-width: 720px)': {
      marginLeft: '40px',
      backgroundColor: '#ffe0b2',
    },
    '@container slot-container (min-width: 480px)': {
      marginLeft: '24px',
      backgroundColor: '#bbdefb',
    },
  },
});

// Adds a third, higher breakpoint that only orders correctly with NUMERIC comparison: "1024px" sorts
// before "720px" lexicographically (Griffel's default), so this needs "compareContainerQueries".
const useThreeBreakpointStyles = makeStyles({
  box: {
    marginLeft: '0px',
    backgroundColor: '#c8e6c9',
    padding: '12px',
    borderRadius: '6px',
    transition: 'margin-left 120ms ease, background-color 120ms ease',

    '@container slot-container (min-width: 720px)': { marginLeft: '40px', backgroundColor: '#ffe0b2' },
    '@container slot-container (min-width: 480px)': { marginLeft: '24px', backgroundColor: '#bbdefb' },
    '@container slot-container (min-width: 1024px)': { marginLeft: '56px', backgroundColor: '#f8bbd0' },
  },
});

const Box = () => {
  const container = useContainerStyles();
  const box = useBoxStyles();

  return (
    <div className={container.container}>
      <div className={box.box}>Resize me — my margin-left tracks the container width.</div>
    </div>
  );
};

const ThreeBreakpointBox = () => {
  const container = useContainerStyles();
  const box = useThreeBreakpointStyles();

  return (
    <div className={container.container}>
      <div className={box.box}>Resize me — steps at 480 / 720 / 1024px.</div>
    </div>
  );
};

// Default renderer: container queries use the same (lexicographic) comparator as media queries, which
// is enough for the 480 → 720 repro.
export const ContainerQueryCascade = () => (
  <div>
    <p>
      Drag the right edge of the dashed box to resize the query container. The inner box&apos;s{' '}
      <code>margin-left</code> &amp; color step up at <strong>480 → 720px</strong> and back down — the highest
      matching breakpoint always wins, no matter the authored order.
    </p>
    <p>
      Inspect <code>&lt;head&gt;</code>: the <code>&lt;style data-make-styles-bucket=&quot;c&quot;&gt;</code>{' '}
      elements carry a <code>data-container</code> attribute and are ordered by their condition.
    </p>
    <Box />
  </div>
);

// Numeric ordering: pass "compareContainerQueries" from "@griffel/utils" so breakpoints across
// magnitudes (e.g. 1024px vs 720px) order correctly.
export const NumericOrderingWithUtils = () => {
  const renderer = useMemo(() => createDOMRenderer(document, { compareContainerQueries }), []);

  return (
    <RendererProvider renderer={renderer}>
      <p>
        Same idea with a third breakpoint at <strong>1024px</strong>. This renderer is created with{' '}
        <code>compareContainerQueries</code> from <code>@griffel/utils</code>, so the steps order numerically
        (<strong>480 → 720 → 1024px</strong>) instead of lexicographically.
      </p>
      <ThreeBreakpointBox />
    </RendererProvider>
  );
};

export default {
  title: 'Container Queries',
};
