import React from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import AppCode from '!!raw-loader!./template/App.js';
import StylesCode from '!!raw-loader!./template/Styles.js';

export default function Playground() {
  const { isDarkTheme } = useColorMode();
  const sandpackTheme = isDarkTheme ? 'dark' : 'github-light';
  return (
    <SandpackProvider
      template="react"
      customSetup={{
        dependencies: { '@griffel/core': 'latest', 'highlight.js': 'latest', 'js-beautify': 'latest' },
        files: { '/App.js': { code: AppCode, hidden: true }, '/Styles.js': { code: StylesCode, active: true } },
      }}
    >
      <SandpackLayout theme={sandpackTheme}>
        <SandpackCodeEditor />
        <SandpackPreview showOpenInCodeSandbox={false} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
