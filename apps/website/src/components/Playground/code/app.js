//@ts-check

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
    /** @type import('@griffel/core').GriffelRenderer */
    const playgroundRenderer = {
      id: 'playground',
      insertCSSRulesToDOM: () => null,
      compareMediaQuery: () => 1,
      insertCSSRules(cssRules) {
        /** @type {string[]} */
        const rules = [];
        for (const bucket of Object.values(cssRules)) {
          if (Array.isArray(bucket)) {
            bucket.forEach(rule => rules.push(rule));
          } else {
            for (const mediaBucket of Object.values(bucket)) {
              mediaBucket.forEach(mediaRule => rules.push(mediaRule));
            }
          }
        }

        const prettified = beautify.css_beautify(rules.join('\n'), { indent_size: 2 });
        setRules(prettified);
      },
      insertionCache: {},
      styleElements: {},
      mediaElements: {},
    };

    styles({
      dir: 'ltr',
      renderer: playgroundRenderer,
    });
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
