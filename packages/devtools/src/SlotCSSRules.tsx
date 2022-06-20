import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';

import { getMonolithicCSSRules } from './getMonolithicCSSRules';
import { MonolithicRulesView } from './MonolithicRulesView';
import { resolveSourceLoc } from './react-render-tracker/resolveSourceLoc';
import { tokens } from './themes';
import { useViewContext } from './ViewContext';

import type { AtomicRules } from './types';

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

export const SlotCSSRules: React.FC<{ slot: string; atomicRules: AtomicRules[]; sourceURL?: string }> = ({
  slot,
  atomicRules,
  sourceURL,
}) => {
  const rules = React.useMemo(() => getMonolithicCSSRules(atomicRules), [atomicRules]);

  const [expanded, setExpanded] = React.useState(true);
  const toggleExpanded = () => setExpanded(v => !v);

  const classes = useStyles();
  const slotClassName = mergeClasses(classes.slotName, !expanded && classes.slotNameCollapsed);

  const { setHighlightedClass } = useViewContext();
  const undoHighlight = () => setHighlightedClass('');

  const jumpToSourceHandler = sourceURL
    ? (e: React.SyntheticEvent) => {
        e.stopPropagation();
        openOriginalCode(sourceURL);
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

function openOriginalCode(sourceURL: string) {
  chrome.devtools.inspectedWindow.eval<string>('window.location.origin', {}, async () => {
    const result = await resolveSourceLoc(sourceURL);
    const results = result.split(':');
    results.pop();
    const line = Number(results.pop()) ?? 1;
    chrome.devtools.panels.openResource(results.join(':'), line - 1, () => ({}));
  });
}
