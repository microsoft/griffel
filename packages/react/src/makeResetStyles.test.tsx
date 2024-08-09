import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { makeResetStyles } from './makeResetStyles';

describe('makeResetStyles', () => {
  it('works outside of React components', () => {
    expect(() => makeResetStyles({ color: 'red' })).not.toThrow();
  });

  it('throws inside React components', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const Example: React.FC = () => {
      makeResetStyles({ color: 'red' });
      return null;
    };
    const root = createRoot(document.createElement('div'));

    expect(() => act(() => root.render(<Example />))).toThrow(/All makeResetStyles\(\) calls should be top level/);

    // Should not throw outside React components after rendering
    expect(() => makeResetStyles({ color: 'red' })).not.toThrow();
  });
});
