import beautify from 'js-beautify';
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';

import { HighlightedCSS } from './HighlightedCSS';
import { useViewContext } from './ViewContext';
import type { MonolithicRules, RuleDetail } from './types';

const formatCSS = (css: string) => {
  const formatted = beautify.css_beautify(`{${css}}`); // add {} for formatting
  return formatted.slice(1, -1).trim(); // remove {}
};

const INDENT = '10px';

const useSingleRuleStyles = makeStyles({
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
});

const SingleRuleView: React.FC<{ rule: RuleDetail; indent?: boolean }> = ({ rule, indent }) => {
  const { highlightedClass, setHighlightedClass } = useViewContext();

  const [clicked, setClicked] = React.useState(false);

  const handleClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (rule.overriddenBy) {
      setClicked(true);
      setHighlightedClass(highlighted => (highlighted === rule.overriddenBy ? '' : rule.overriddenBy!));
    } else {
      setHighlightedClass('');
    }
  };

  React.useEffect(() => {
    if (!highlightedClass || highlightedClass !== rule.overriddenBy) {
      setClicked(false);
    }
  }, [highlightedClass, rule.overriddenBy]);

  const classes = useSingleRuleStyles();
  const className = mergeClasses(
    rule.overriddenBy && classes.overriden,
    indent && classes.indent,
    (clicked || highlightedClass === rule.className) && classes.highlighted,
  );

  return (
    <div onClick={handleClick} className={className}>
      <HighlightedCSS code={formatCSS(rule.css)} />
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
