import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/vs.css';
import beautify from 'js-beautify';
import React from 'react';
import css from 'highlight.js/lib/languages/css';
import styles from './styles';
hljs.registerLanguage('css', css);

export default function App() {
  const [rules, setRules] = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    const styleTag = document.createElement('style');
    document.head.append(styleTag);

    /** @type import('@griffel/core').GriffelRenderer */
    const playgroundRenderer = {
      id: 'playground',
      insertCSSRules(cssRules) {
        Object.values(cssRules)
          .flatMap(rules => rules)
          .forEach(cssRuleWithMeta => {
            const cssRule = Array.isArray(cssRuleWithMeta) ? cssRuleWithMeta[0] : cssRuleWithMeta;

            styleTag.sheet?.insertRule(cssRule);
          });

        if (!styleTag.sheet) {
          return;
        }

        const raw = [
          ...new Set(
            Array.from(styleTag.sheet.cssRules)
              .reverse()
              .map(cssRule => cssRule.cssText),
          ),
        ].join('\n');
        const prettified = beautify.css_beautify(raw, { indent_size: 2 });
        setRules(prettified);
      },
      insertionCache: {},
      stylesheets: {},
      compareMediaQueries: () => 1,
    };

    styles({
      dir: 'ltr',
      renderer: playgroundRenderer,
    });

    return () => {
      styleTag.remove();
    };
  }, []);

  React.useEffect(() => {
    if (ref.current) {
      hljs.highlightElement(ref.current);
    }
  }, [rules]);

  return (
    <pre>
      <code ref={ref} className="language-css">
        {rules}
      </code>
    </pre>
  );
}
