import * as React from 'react';
import hash from '@emotion/hash';
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
  },
  bar: {
    alignItems: 'center',
    display: 'flex',
    columnGap: '4px',
    fontFamily: 'system-ui',
    fontSize: '12px',

    position: 'sticky',
    top: 0,
    zIndex: 99,
    backgroundColor: tokens.background,
  },
  input: {
    color: 'inherit',
    flexGrow: 1,
    backgroundColor: tokens.slotNameBackground,
    ...shorthands.margin('2px'),
    ...shorthands.padding('2px'),
    ...shorthands.border('1px', 'solid', tokens.slotNameBorder),

    ':focus-visible': {
      backgroundColor: 'inherit',
      outlineStyle: 'solid',
      outlineWidth: 'thin',
    },
  },
  info: {
    cursor: 'help',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    marginRight: '4px',
  },
  rules: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '5px',
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
      <div className={classes.bar}>
        <input
          type="text"
          placeholder="Filter"
          className={classes.input}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className={classes.info} title={`"dir"=${debugResultRoot.direction}`}>
          {debugResultRoot.direction.toLocaleUpperCase()}
        </div>
      </div>
      <div className={classes.rules}>
        <ViewContext.Provider value={contextValue}>
          {filteredSlots.map(({ slot, rules }) => {
            const key = hash(slot + rules.map(rule => rule.cssRule).join(''));
            return <SlotCSSRules key={key} slot={slot} atomicRules={rules} />;
          })}
        </ViewContext.Provider>
      </div>
    </div>
  );
};
