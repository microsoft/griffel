import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';

import { getMonolithicCSSRules } from './getMonolithicCSSRules';
import { MonolithicRulesView } from './MonolithicRulesView';
import { tokens } from './themes';
import { useViewContext } from './ViewContext';

import type { AtomicRules } from './types';

const useStyles = makeStyles({
  slotName: {
    cursor: 'pointer',
    ...shorthands.padding('2px', '5px'),
    ...shorthands.margin('5px', 0),
    ...shorthands.borderTop('1px', 'solid', tokens.slotNameBorder),
    ...shorthands.borderBottom('1px', 'solid', tokens.slotNameBorder),
    backgroundColor: tokens.slotNameBackground,
  },
  rules: {
    ...shorthands.padding(0, '5px'),
  },
});

export const SlotCSSRules: React.FC<{ slot: string; atomicRules: AtomicRules[] }> = ({ slot, atomicRules }) => {
  const rules = React.useMemo(() => getMonolithicCSSRules(atomicRules), [atomicRules]);
  const classes = useStyles();

  const [expanded, setExpanded] = React.useState(true);
  const toggleExpanded= () => setExpanded(v => !v);

  const { setHighlightedClass } = useViewContext();
  const undoHighlight = () => setHighlightedClass('');

  return (
    <>
      <pre className={classes.slotName} onClick={handleSlotNameClick}>
        {slot}
      </pre>
      {expanded && (
        <div className={classes.rules} onClick={undoHighlight}>
          <MonolithicRulesView rules={rules} />
        </div>
      )}
    </>
  );
};
