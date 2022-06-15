import { SequenceHash } from '../types';

declare global {
  interface Window {
    __GRIFFEL_DEVTOOLS__: {
      getInfo: (el: HTMLElement) => DebugResult | undefined;
    };
  }
}

export type DebugAtomicClassName = { className: string; overriddenBy?: string };
export type DebugCSSRules = Record<string /* className */, string /* cssRule */>;
export type DebugSourceMap = {
  sourceURL: string;
  lineNumber: number;
  columnNumber: number;
};

export type DebugSequence = {
  sequenceHash: SequenceHash;
  direction: 'ltr' | 'rtl';
  children: DebugSequence[];
  debugClassNames: DebugAtomicClassName[];

  slot?: string;
  rules?: DebugCSSRules;

  sourceMap?: DebugSourceMap;
};

export type DebugResult = DebugSequence;
