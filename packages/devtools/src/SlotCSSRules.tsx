import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';

import { DARK_THEME_COLOR_TOKENS, LIGHT_THEME_COLOR_TOKENS } from './colorTokens';
import { getMonolithicCSSRules } from './getMonolithicCSSRules';
import { MonolithicRulesView } from './MonolithicRulesView';
import { useThemeContext } from './ThemeContext';
import { useViewContext } from './ViewContext';

import type { AtomicRules } from './types';

const useStyles = makeStyles({
  slotName: {
    ...shorthands.padding('2px', '5px'),
    ...shorthands.margin('5px', 0),
    ...shorthands.borderTop('1px', 'solid', LIGHT_THEME_COLOR_TOKENS.slotNameBorder),
    ...shorthands.borderBottom('1px', 'solid', LIGHT_THEME_COLOR_TOKENS.slotNameBorder),
    backgroundColor: LIGHT_THEME_COLOR_TOKENS.slotNameBackground,
  },
  slotNameDark: {
    backgroundColor: DARK_THEME_COLOR_TOKENS.slotNameBackground,
    borderTopColor: DARK_THEME_COLOR_TOKENS.slotNameBorder,
    borderBottomColor: DARK_THEME_COLOR_TOKENS.slotNameBorder,
  },
  rules: {
    ...shorthands.padding(0, '5px'),
  },
});

export const SlotCSSRules: React.FC<{ slot: string; atomicRules: AtomicRules[] }> = ({ slot, atomicRules }) => {
  const rules = React.useMemo(() => getMonolithicCSSRules(atomicRules), [atomicRules]);

  const theme = useThemeContext();
  const classes = useStyles();
  const slotNameClassName = mergeClasses(classes.slotName, theme === 'dark' && classes.slotNameDark);

  const { setHighlightedClass } = useViewContext();
  const undoHighlight = () => setHighlightedClass('');

  return (
    <>
      <pre className={slotNameClassName}>{slot}</pre>
      <div className={classes.rules} onClick={undoHighlight}>
        <MonolithicRulesView rules={rules} />
      </div>
    </>
  );
};
