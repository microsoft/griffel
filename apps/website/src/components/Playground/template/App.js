import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/vs.css';
import prettier from 'prettier/esm/standalone.mjs';
import postcss from 'prettier/esm/parser-postcss.mjs';
import React from 'react';
import css from 'highlight.js/lib/languages/css';
import styles from './Styles';
hljs.registerLanguage('css', css);

export default function App() {
  const [rules, setRules] = React.useState('');
  const ref = React.useRef(null);
  React.useEffect(() => {
    const playgroundRenderer = {
      id: 'playground',
      insertCSSRules(cssRules) {
        const raw = Object.values(cssRules).flat().join('\n');
        const prettified = prettier.format(raw, { parser: 'css', plugins: [postcss] });
        setRules(prettified);
      },
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
