import beautify from 'js-beautify';
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { useFloating, flip, shift } from '@floating-ui/react-dom';

import { HighlightedCSS } from './HighlightedCSS';
import { useViewContext } from './ViewContext';
import type { MonolithicRules, RuleDetail } from './types';
import { tokens } from './themes';

const formatCSS = (css: string) => {
  const formatted = beautify.css_beautify(`{${css}}`); // add {} for formatting
  return formatted.slice(1, -1).trim(); // remove {}
};

const INDENT = '10px';

const useSingleRuleStyles = makeStyles({
  root: {
    position: 'relative',
    ':hover pre': {
      visibility: 'visible',
    },
  },
  overriden: {
    textDecorationLine: 'line-through',
  },
  indent: {
    marginLeft: INDENT,
  },
  highlighted: {
    outlineColor: 'orangered',
    outlineStyle: 'dashed',
    outlineWidth: '1px',
  },
  tooltip: {
    visibility: 'hidden',
    display: 'inline-block',
    textDecorationLine: 'none',
    color: tokens.cssSelector,
    backgroundColor: tokens.tooltipBackground,
    textAlign: 'center',
    ...shorthands.borderRadius('6px'),
    ...shorthands.padding('5px'),
    zIndex: 1,
  },
});

const SingleRuleView: React.FC<{ rule: RuleDetail; indent?: boolean }> = ({ rule, indent }) => {
  const { highlightedClass, setHighlightedClass } = useViewContext();

  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (rule.overriddenBy) {
      setHighlightedClass(highlighted => (highlighted === rule.overriddenBy ? '' : rule.overriddenBy!));
    } else {
      setHighlightedClass('');
    }
  };

  const classes = useSingleRuleStyles();
  const rootClassName = mergeClasses(
    classes.root,
    rule.overriddenBy && classes.overriden,
    indent && classes.indent,
    highlightedClass === rule.className && classes.highlighted,
  );

  const { x, y, reference, floating, strategy } = useFloating({
    placement: 'right',
    middleware: [
      flip({
        fallbackPlacements: ['top', 'bottom'],
      }),
      shift(),
    ],
  });
  const tooltipInlineStyle = {
    position: strategy,
    top: y ?? '',
    left: x ?? '',
  };

  return (
    <div onClick={handleClick} className={rootClassName}>
      <HighlightedCSS ref={reference} code={formatCSS(rule.css)} />
      <pre ref={floating} className={classes.tooltip} style={tooltipInlineStyle}>
        {rule.className}
      </pre>
    </div>
  );
};

const useMonolithicRulesStyles = makeStyles({
  atRulesIndent: {
    marginLeft: INDENT,
  },
  lineSpacing: {
    ...shorthands.margin('5px', 0),
  },
  noLineSpacing: {
    ...shorthands.margin(0),
  },
});

type MonolithicRulesViewProps = {
  rules: MonolithicRules;
  // specify if there should be spacing between rules with different selectors
  noLineSpacing?: boolean;
};

export const MonolithicRulesView: React.FC<MonolithicRulesViewProps> = props => {
  const { rules, noLineSpacing } = props;
  const classes = useMonolithicRulesStyles();

  return (
    <>
      {Object.entries(rules).map(([selector, rules]) => {
        return (
          <div key={selector} className={noLineSpacing ? classes.noLineSpacing : classes.lineSpacing}>
            {selector && <HighlightedCSS code={`${selector} {`} />}
            {Array.isArray(rules) ? (
              rules.map(rule => <SingleRuleView key={rule.css} rule={rule} indent={!!selector} />)
            ) : (
              <div className={classes.atRulesIndent}>
                <MonolithicRulesView rules={rules} noLineSpacing />
              </div>
            )}
            {selector && <HighlightedCSS code={`}`} />}
          </div>
        );
      })}
    </>
  );
};
