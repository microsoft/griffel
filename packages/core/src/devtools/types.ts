import type { SequenceHash } from '../types';

declare global {
  interface Window {
    __GRIFFEL_DEVTOOLS__: {
      getInfo: (el: HTMLElement) => DebugResult | undefined;
    };
  }
}

/**
 * @internal
 */
export type DebugAtomicClassName = { className: string; overriddenBy?: string };
/**
 * @internal
 */
export type DebugCSSRules = Record<string /* className */, string /* cssRule */>;

/**
 * @internal
 */
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
