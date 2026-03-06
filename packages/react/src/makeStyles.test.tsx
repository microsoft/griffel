import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { makeStyles } from './makeStyles';

describe('makeStyles', () => {
  it('works outside of React components', () => {
    expect(() => makeStyles({ root: { color: 'red' } })).not.toThrow();
  });

  it('throws inside React components', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const Example: React.FC = () => {
      makeStyles({ root: { color: 'red' } });
      return null;
    };
    const root = createRoot(document.createElement('div'));

    expect(() => act(() => root.render(<Example />))).toThrow(/All makeStyles\(\) calls should be top level/);

    // Should not throw outside React components after rendering
    expect(() => makeStyles({ root: { color: 'red' } })).not.toThrow();
  });
});
