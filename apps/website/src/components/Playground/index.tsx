import React from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import AppCode from '!!raw-loader!./template/App.tsx';
import StylesCode from '!!raw-loader!./template/Styles.tsx';

const PLAYGROUND_HEIGHT = 400;

export default function Playground() {
  const { isDarkTheme } = useColorMode();
  const sandpackTheme = isDarkTheme ? 'dark' : 'github-light';
  return (
    <SandpackProvider
      template="react-ts"
      customSetup={{
        dependencies: { '@griffel/core': 'latest', 'highlight.js': 'latest', 'js-beautify': 'latest' },
        files: { '/App.js': { code: AppCode, hidden: true }, '/Styles.js': { code: StylesCode, active: true } },
      }}
    >
      <SandpackLayout theme={sandpackTheme}>
        <SandpackCodeEditor showLineNumbers customStyle={{ height: PLAYGROUND_HEIGHT }} />
        <SandpackPreview customStyle={{ height: PLAYGROUND_HEIGHT }} showOpenInCodeSandbox={false} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
