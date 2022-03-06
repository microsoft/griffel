import React from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview } from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import { useLocation } from '@docusaurus/router';
import AppCode from '!!raw-loader!./template/app.js';
import StylesCode from '!!raw-loader!./template/styles.js';
import PaddingCode from '!!raw-loader!./template/padding.js';
import MediaCode from '!!raw-loader!./template/media.js';
import BorderCode from '!!raw-loader!./template/border.js';
import MarginCode from '!!raw-loader!./template/margin.js';
import GlobalCode from '!!raw-loader!./template/global.js';
import PsedoSelectorsCode from '!!raw-loader!./template/pseudo-selectors.js';
import PsedoElementsCode from '!!raw-loader!./template/pseudo-elements.js';
import SelectorsCode from '!!raw-loader!./template/selectors.js';
import NestedCode from '!!raw-loader!./template/nested.js';

const PLAYGROUND_HEIGHT = 400;

const examples: Record<string, string> = {
  padding: PaddingCode,
  media: MediaCode,
  border: BorderCode,
  margin: MarginCode,
  global: GlobalCode,
  'pseudo-selectors': PsedoSelectorsCode,
  'pseudo-elements': PsedoElementsCode,
  selectors: SelectorsCode,
  nested: NestedCode,
};

export default function Playground() {
  const { isDarkTheme } = useColorMode();
  const sandpackTheme = isDarkTheme ? 'dark' : 'github-light';
  const location = useLocation();
  const example = examples[location.pathname.split('/').slice(-1)[0]] ?? StylesCode;

  return (
    <SandpackProvider
      template="react"
      customSetup={{
        dependencies: { '@griffel/core': 'latest', 'highlight.js': 'latest', 'js-beautify': 'latest' },
        files: {
          '/App.js': { code: AppCode, hidden: true },
          // Template files are in JS but type checked, don't want unnecessary comments leaking into docs
          '/styles.js': { code: example.replace('//@ts-check\n', ''), active: true },
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
