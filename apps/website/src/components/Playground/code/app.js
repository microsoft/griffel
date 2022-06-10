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
      insertCSSRules(cssRules) {
        const raw = Object.values(cssRules)
          .reduce((acc, val) => acc.concat(val), [])
          .join('\n');
        const prettified = beautify.css_beautify(raw, { indent_size: 2 });
        setRules(prettified);
      },
      insertionCache: {},
      styleElements: {},
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
