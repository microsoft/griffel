import { getRulesBySlots } from './utils';
import type { DebugResult } from '@griffel/core';

describe('getRulesBySlots', () => {
  it('traverse debug result, gather and return all makeStyles slot name and rules', () => {
    const makeStylesNodes: DebugResult[] = [
      {
        sequenceHash: '___abcdef0_0000000',
        direction: 'ltr',
        children: [],
        debugClassNames: [{ className: 'fabcde0' }],
        rules: {
          fabcde0: '.fabcde0{background-color:transparent;}',
        },
        slot: 'root',
      },
      {
        sequenceHash: '___abcdef1_0000000',
        direction: 'ltr',
        children: [],
        debugClassNames: [{ className: 'fabcde1', overriddenBy: 'fabcde2' }],
        rules: {
          fabcde1: '.fabcde1{display:block;}',
        },
        slot: 'slot1',
      },
      {
        sequenceHash: '___abcdef2_0000000',
        direction: 'ltr',
        children: [],
        debugClassNames: [{ className: 'fabcde2' }],
        rules: {
          fabcde2: '.fabcde2{display:none;}',
        },
        slot: 'slot2',
      },
    ];
    const debugResultRoot = {
      children: [
        makeStylesNodes[0],
        {
          children: [makeStylesNodes[1], makeStylesNodes[2]],
        },
      ],
    };
    expect(getRulesBySlots(debugResultRoot as DebugResult)).toEqual([
      {
        slot: 'slot2',
        rules: [
          {
            cssRule: '.fabcde2{display:none;}',
          },
        ],
      },
      {
        slot: 'slot1',
        rules: [
          {
            cssRule: '.fabcde1{display:block;}',
            overriddenBy: 'fabcde2',
          },
        ],
      },
      {
        slot: 'root',
        rules: [
          {
            cssRule: '.fabcde0{background-color:transparent;}',
          },
        ],
      },
    ]);
  });
});
