import React from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import AppCode from '!!raw-loader!./template/App.js';
import StylesCode from '!!raw-loader!./template/Styles.js';

const PLAYGROUND_HEIGHT = 400;

export default function Playground() {
  const { isDarkTheme } = useColorMode();
  const sandpackTheme = isDarkTheme ? 'dark' : 'github-light';
  return (
    <SandpackProvider
      template="react"
      customSetup={{
        dependencies: {
          '@griffel/core': 'latest',
          'highlight.js': 'latest',
          'js-beautify': 'latest',
        },
        files: {
          '/App.js': { code: AppCode, hidden: true },
          // Template files are in JS but type checked, don't want unnecessary comments leaking into docs
          '/Styles.js': { code: StylesCode.replace('//@ts-check\n', ''), active: true },
        },
      }}
    >
      <SandpackLayout theme={sandpackTheme}>
        <SandpackCodeEditor showLineNumbers customStyle={{ height: PLAYGROUND_HEIGHT }} />
        <SandpackPreview customStyle={{ height: PLAYGROUND_HEIGHT }} showOpenInCodeSandbox={false} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
