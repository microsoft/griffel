import * as React from 'react';
import { makeStaticStyles, makeStyles, shorthands } from '@griffel/react';

import { SlotCSSRules } from './SlotCSSRules';
import { filterSlots, getRulesBySlots } from './utils';
import { tokens } from './themes';
import { ViewContext } from './ViewContext';

import type { DebugResult } from '@griffel/core';

const useStyles = makeStyles({
  root: {
    backgroundColor: tokens.background,
    color: tokens.foreground,
    paddingBottom: '10px',
  },
  input: {
    width: 'calc(100% - 20px)',
    color: 'inherit',
    backgroundColor: 'inherit',
    ...shorthands.margin('5px'),
    ...shorthands.padding('2px'),
    ...shorthands.borderRadius('2px'),
    ...shorthands.border('1px', 'solid'),
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

  const [searchTerm, setSearchTerm] = React.useState('');
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredSlots = React.useMemo(() => filterSlots(slots, searchTerm), [slots, searchTerm]);

  return (
    <div className={classes.root}>
      <input
        type="text"
        placeholder="filter"
        className={classes.input}
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className={classes.info}>direction: {debugResultRoot.direction}</div>
      <ViewContext.Provider value={contextValue}>
        {filteredSlots.map(({ slot, rules }) => (
          <SlotCSSRules key={slot} slot={slot} atomicRules={rules} />
        ))}
      </ViewContext.Provider>
    </div>
  );
};
