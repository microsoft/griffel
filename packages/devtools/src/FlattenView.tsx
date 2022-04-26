import * as React from 'react';
import { makeStaticStyles, makeStyles, shorthands } from '@griffel/react';

import { SlotCSSRules } from './SlotCSSRules';
import { getRulesBySlots } from './utils';
import { ViewContext } from './ViewContext';

import type { DebugResult } from '@griffel/core';

const useStyles = makeStyles({
  root: {
    paddingBottom: '10px',
  },
  info: {
    ...shorthands.margin(0, '5px'),
  },
});

const useStaticStyles = makeStaticStyles({
  pre: {
    fontFamily: 'Menlo, Consolas, "dejavu sans mono", monospace',
    margin: 'initial',
    whiteSpace: 'normal',
    fontSize: '11px',
    lineHeight: '14px',
  },
});

type FlattenViewProps = { debugResultRoot: DebugResult };

export const FlattenView: React.FC<FlattenViewProps> = props => {
  const { debugResultRoot } = props;
  const slots = React.useMemo(() => getRulesBySlots(debugResultRoot), [debugResultRoot]);

  useStaticStyles();
  const classes = useStyles();

  const [highlightedClass, setHighlightedClass] = React.useState('');
  const contextValue = React.useMemo(() => ({ highlightedClass, setHighlightedClass }), [highlightedClass]);

  return (
    <div className={classes.root}>
      <div className={classes.info}>direction: {debugResultRoot.direction}</div>
      <ViewContext.Provider value={contextValue}>
        {slots.map(({ slot, rules }) => (
          <SlotCSSRules key={slot} slot={slot} atomicRules={rules} />
        ))}
      </ViewContext.Provider>
    </div>
  );
};
