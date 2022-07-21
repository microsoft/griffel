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

export type DebugSequence = {
  sequenceHash: SequenceHash;
  direction: 'ltr' | 'rtl';
  children: DebugSequence[];
  debugClassNames: DebugAtomicClassName[];

  slot?: string;
  rules?: DebugCSSRules;

  sourceURL?: string;
};

export type DebugResult = DebugSequence;
