import { SequenceHash } from '../types';

declare global {
  interface Window {
    __MAKESTYLES_DEVTOOLS__: {
      getInfo: (el: HTMLElement) => DebugResult | undefined;
    };
  }
}

export type DebugStyleRule = { className: string; cssRule: string };
export type DebugSequence = {
  sequenceHash: SequenceHash;
  direction: 'ltr' | 'rtl';
  children: DebugSequence[];

  slot?: string;
  rules?: DebugStyleRule[];
};

export type DebugResult = DebugSequence;
