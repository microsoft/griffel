import * as React from 'react';
import type { DebugResult } from '@griffel/core';
import type { StoryObj } from '@storybook/react';

import { FlattenView } from '../FlattenView';
import { darkTheme, lightTheme } from '../themes';

const debugResultRootAtomic: DebugResult = {
  sequenceHash: '___29aowz0_1rg0tlg',
  direction: 'ltr',
  children: [
    {
      sequenceHash: '___12k6f67_1qq0ij4',
      direction: 'ltr',
      children: [
        {
          sequenceHash: '___1cxgqvx_0000000',
          direction: 'ltr',
          children: [],
          debugClassNames: [
            { className: 'f3rmtva', overriddenBy: 'fdmssx0' },
            { className: 'f1s6fcnf' },
            { className: 'f8491dx' },
            { className: 'f139dqjh', overriddenBy: 'f19s2fr6' },
          ],
          rules: {
            f3rmtva: '.f3rmtva{background-color:transparent;}',
            f1s6fcnf: '.f1s6fcnf{outline-style:none;}',
            f8491dx: '.f8491dx:hover{cursor:pointer;}',
            f139dqjh: '.f139dqjh:hover{background-color:#ddd;}',
          },
          slot: 'root',
        },
        {
          sequenceHash: '___1wgw9g0_0000000',
          direction: 'ltr',
          children: [],
          debugClassNames: [
            { className: 'fdmssx0', overriddenBy: 'f3xbvq9' },
            { className: 'f183xr6j' },
            { className: 'f19s2fr6' },
            { className: 'f15639b', overriddenBy: 'fy4xd57' },
          ],
          rules: {
            fdmssx0: '.fdmssx0{background-color:#106ebe;}',
            f183xr6j: '.f183xr6j{color:#eff6fc;}',
            f19s2fr6: '.f19s2fr6:hover{background-color:#2899f5;}',
            f15639b: '@media screen and (max-width: 992px){.f15639b:hover{background-color:green;}}',
          },
          slot: 'primary',
        },
      ],
      debugClassNames: [
        { className: 'fdmssx0', overriddenBy: 'f3xbvq9' },
        { className: 'f1s6fcnf' },
        { className: 'f8491dx' },
        { className: 'f19s2fr6' },
        { className: 'f183xr6j' },
        { className: 'f15639b', overriddenBy: 'fy4xd57' },
      ],
    },
    {
      sequenceHash: '___b844lz0_0000000',
      direction: 'ltr',
      children: [],
      debugClassNames: [
        { className: 'f3xbvq9' },
        { className: 'f7sr9i2' },
        { className: 'fg103nd' },
        { className: 'fsz8qd4' },
        { className: 'f7wpa5l' },
        { className: 'fy4xd57' },
      ],
      rules: {
        f3xbvq9: '.f3xbvq9{background-color:red;}',
        f7sr9i2: '.f7sr9i2>div{color:pink;}',
        fg103nd: '.fg103nd>div:hover{border-top-color:#2899f5;}',
        fsz8qd4: '@media (forced-colors: active):{.fsz8qd4{color:purple;}}',
        f7wpa5l: '@media screen and (max-width: 992px){.f7wpa5l:hover{color:red;}}',
        fy4xd57: '@media screen and (max-width: 992px){.fy4xd57:hover{background-color:blue;}}',
      },
      slot: 'primary',
    },
  ],
  debugClassNames: [
    { className: 'f3xbvq9' },
    { className: 'f1s6fcnf' },
    { className: 'f8491dx' },
    { className: 'f19s2fr6' },
    { className: 'f183xr6j' },
    { className: 'fy4xd57' },
    { className: 'f7sr9i2' },
    { className: 'fg103nd' },
    { className: 'fsz8qd4' },
    { className: 'f7wpa5l' },
  ],
};

const debugResultRootReset: DebugResult = {
  sequenceHash: 'rabc',
  direction: 'ltr',
  children: [],
  debugClassNames: [{ className: 'rabc' }],
  rules: {
    rabc: '.rabc{background-color:yellow; width: 100%;}.rabc:hover{background-color:red;}',
  },
  slot: 'RESET STYLES',
};

const debugResultRoot: DebugResult = {
  sequenceHash: debugResultRootAtomic.sequenceHash + debugResultRootReset.sequenceHash,
  direction: 'ltr',
  children: [debugResultRootAtomic, debugResultRootReset],
  debugClassNames: [...debugResultRootAtomic.debugClassNames, ...debugResultRootReset.debugClassNames],
};

console.log(debugResultRoot);

export const Default: StoryObj<{ theme: 'dark' | 'light' }> = {
  render: ({ theme }) => {
    const tokens = theme === 'dark' ? darkTheme : lightTheme;

    return (
      <div
        style={{
          ...tokens,
          border: '3px solid gray',
          width: 400,
          height: 600,
          overflowY: 'auto',
        }}
      >
        <FlattenView debugResultRoot={debugResultRoot} />
      </div>
    );
  },

  args: {
    theme: 'light',
  },
};

export default {
  title: 'FlattenView',
  argTypes: {
    theme: {
      options: ['light', 'dark'],
      control: { type: 'radio' },
    },
  },
};
