import React from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import AppCode from '!!raw-loader!./template/App.js';
import StylesCode from '!!raw-loader!./template/Styles.js';

export default function Playground() {
  const { isDarkTheme } = useColorMode();
  const sandpackTheme = isDarkTheme ? 'sandpack-dark' : 'github-light';
  return (
    <Sandpack
      template="react"
      theme={sandpackTheme}
      files={{ '/App.js': { code: AppCode, hidden: true }, '/Styles.js': { code: StylesCode, active: true } }}
      customSetup={{ dependencies: { '@griffel/core': 'latest', 'highlight.js': 'latest', prettier: 'latest' } }}
      options={{ editorHeight: 450 }}
    />
  );
}
