import React from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { oceanBlue } from '@codesandbox/sandpack-themes';
import { useLocation } from '@docusaurus/router';

import AppCode from './code/app';
import DefaultStylesCode from './code/styles';
import { PlaygroundUrl } from './PlaygroundUrl';
import { PlaygroundShare } from './PlaygroundShare';

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
  const location = useLocation();
  const template = templates[location.hash.slice(1)] ?? DefaultStylesCode;

  return (
    <>
      <SandpackProvider
        theme={oceanBlue}
        template="react"
        files={{
          '/App.js': {
            // "AppCode" is a string as it's processed by "raw-loader", see "webpackLoader.js"
            code: AppCode as unknown as string,
            hidden: true,
          },
          // Template files are in JS but type checked, don't want unnecessary comments leaking into docs
          '/styles.js': { code: template, active: true },
        }}
        customSetup={{
          dependencies: {
            '@griffel/core': 'latest',
            'highlight.js': 'latest',
            'js-beautify': 'latest',
          },
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers style={{ height: PLAYGROUND_HEIGHT }} />
          <SandpackPreview style={{ height: PLAYGROUND_HEIGHT }} showOpenInCodeSandbox={false} />
        </SandpackLayout>

        <PlaygroundUrl template={template} />
      </SandpackProvider>

      <div className="margin-top--xs" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <PlaygroundShare />
      </div>
    </>
  );
}
