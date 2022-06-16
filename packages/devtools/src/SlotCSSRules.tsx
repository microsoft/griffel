import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';

import { getMonolithicCSSRules } from './getMonolithicCSSRules';
import { MonolithicRulesView } from './MonolithicRulesView';
import { tokens } from './themes';
import { useViewContext } from './ViewContext';

import type { AtomicRules } from './types';
import { loadOriginalSourceLoc } from './sourceMap';
import type { DebugSourceLoc } from '@griffel/core';

const useStyles = makeStyles({
  slotName: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',

    cursor: 'pointer',
    ...shorthands.padding('2px', '5px'),
    ...shorthands.borderTop('1px', 'solid', tokens.slotNameBorder),
    ...shorthands.borderBottom('1px', 'solid', tokens.slotNameBorder),
    backgroundColor: tokens.slotNameBackground,

    ':before': {
      content: "''",
      position: 'absolute',
      right: '5px',
      width: 0,
      height: 0,
      fontSize: 0,
      ...shorthands.borderTop('3px', 'solid', tokens.foreground),
      ...shorthands.borderRight('3px', 'solid', 'transparent'),
      ...shorthands.borderLeft('3px', 'solid', 'transparent'),
      ...shorthands.borderBottom('3px', 'solid', 'transparent'),
    },
  },
  slotNameCollapsed: {
    ':before': {
      ...shorthands.borderTop('3px', 'solid', 'transparent'),
      ...shorthands.borderRight('3px', 'solid', tokens.foreground),
    },
  },
  toSourceCode: {
    cursor: 'help',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  rules: {
    ...shorthands.padding(0, '5px'),
  },
});

export const SlotCSSRules: React.FC<{ slot: string; atomicRules: AtomicRules[]; sourceLoc?: DebugSourceLoc }> = ({
  slot,
  atomicRules,
  sourceLoc,
}) => {
  const rules = React.useMemo(() => getMonolithicCSSRules(atomicRules), [atomicRules]);

  const [expanded, setExpanded] = React.useState(true);
  const toggleExpanded = () => setExpanded(v => !v);

  const classes = useStyles();
  const slotClassName = mergeClasses(classes.slotName, !expanded && classes.slotNameCollapsed);

  const { setHighlightedClass } = useViewContext();
  const undoHighlight = () => setHighlightedClass('');

  const jumpToSourceHandler = sourceLoc
    ? (e: React.SyntheticEvent) => {
        e.stopPropagation();
        chrome.devtools.inspectedWindow.eval<string>('window.location.origin', {}, async () => {
          const { lineNumber, sourceURL } = await loadOriginalSourceLoc(sourceLoc);
          chrome.devtools.panels.openResource(sourceURL, lineNumber - 1, () => ({}));
        });
      }
    : undefined;

  return (
    <div>
      <pre className={slotClassName} onClick={toggleExpanded}>
        {slot}
        {jumpToSourceHandler && (
          <div className={classes.toSourceCode} onClick={jumpToSourceHandler} title={`inspect source`}>
            {`</>`}
          </div>
        )}
      </pre>
      {expanded && (
        <div className={classes.rules} onClick={undoHighlight}>
          <MonolithicRulesView rules={rules} />
        </div>
      )}
    </div>
  );
};
