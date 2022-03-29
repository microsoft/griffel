import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';

import { getMonolithicCSSRules } from './getMonolithicCSSRules';
import { MonolithicRulesView } from './RulesView';
import { useViewContext } from './ViewContext';

import type { AtomicRules } from './types';

const useStyles = makeStyles({
  slotName: {
    ...shorthands.padding('2px', '5px'),
    ...shorthands.margin('5px', 0),
    ...shorthands.borderTop('1px', 'solid', 'grey'),
    ...shorthands.borderBottom('1px', 'solid', 'grey'),
  },
  rules: {
    ...shorthands.padding(0, '5px'),
  },
});

export const SlotCSSRules: React.FC<{ slot: string; atomicRules: AtomicRules[] }> = ({ slot, atomicRules }) => {
  const rules = React.useMemo(() => getMonolithicCSSRules(atomicRules), [atomicRules]);

  const classes = useStyles();

  const { setHighlightedClass } = useViewContext();
  const undoHighlight = () => setHighlightedClass('');

  return (
    <>
      <pre className={classes.slotName}>{slot}</pre>
      <div className={classes.rules} onClick={undoHighlight}>
        <MonolithicRulesView rules={rules} />
      </div>
    </>
  );
};
