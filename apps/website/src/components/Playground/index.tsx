import React from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import { useLocation } from '@docusaurus/router';

import AppCode from './code/app';
import DefaultStylesCode from './code/styles';

const ctx = require.context('./code/templates', false, /\.js$/);

const templates: Record<string, string> = ctx.keys().reduce((acc, modulePath) => {
  if (modulePath.includes('app')) {
    return acc;
  }

  const templateName = modulePath.split('/').slice(-1)[0].split('.')[0];
  acc[templateName] = ctx(modulePath).default;
  return acc;
}, {} as Record<string, string>);

const PLAYGROUND_HEIGHT = 400;

export default function Playground() {
  const { colorMode } = useColorMode();

  const sandpackTheme = colorMode === 'dark' ? 'dark' : 'github-light';
  const location = useLocation();
  const template = templates[location.hash.slice(1)] ?? DefaultStylesCode;

  return (
    <SandpackProvider
      template="react"
      customSetup={{
        dependencies: { '@griffel/core': 'latest', 'highlight.js': 'latest', 'js-beautify': 'latest' },
        files: {
          '/App.js': {
            // "AppCode" is a string as it's processed by "raw-loader", see "webpackLoader.js"
            code: AppCode as unknown as string,
            hidden: true,
          },
          // Template files are in JS but type checked, don't want unnecessary comments leaking into docs
          '/styles.js': { code: template, active: true },
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
