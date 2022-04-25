import * as React from 'react';
import { makeStaticStyles, makeStyles, shorthands } from '@griffel/react';

import { SlotCSSRules } from './SlotCSSRules';
import { getRulesBySlots } from './utils';
import { ViewContext } from './ViewContext';

import type { DebugResult } from '@griffel/core';
import type { SlotInfo } from './types';

const View: React.FC<{ slots: SlotInfo[] }> = ({ slots }) => {
  const [highlightedClass, setHighlightedClass] = React.useState('');
  const contextValue = React.useMemo(() => ({ highlightedClass, setHighlightedClass }), [highlightedClass]);

  return (
    <ViewContext.Provider value={contextValue}>
      {slots.map(({ slot, rules }) => (
        <SlotCSSRules key={slot} slot={slot} atomicRules={rules} />
      ))}
    </ViewContext.Provider>
  );
};

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

export const FlattenView = ({ debugResultRoot }: { debugResultRoot: DebugResult }) => {
  const slots = React.useMemo(() => getRulesBySlots(debugResultRoot), [debugResultRoot]);

  useStaticStyles();
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.info}>direction: {debugResultRoot.direction}</div>
      <View slots={slots} />
    </div>
  );
};
