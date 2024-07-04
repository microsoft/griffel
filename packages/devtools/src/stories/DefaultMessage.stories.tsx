import * as React from 'react';
import type { StoryFn } from '@storybook/react';

import { DefaultMessage } from '../DefaultMessage';

export const Default: StoryFn = () => (
  <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
    <div style={{ border: '3px solid gray', width: 300 }}>
      <DefaultMessage />
    </div>
    <div style={{ border: '3px solid gray', width: 600 }}>
      <DefaultMessage />
    </div>
  </div>
);

export default {
  title: 'DefaultMessage',
};
