/*
 * @vitest-environment node
 */

import { describe, it, expect, vi } from 'vitest';
import { logError } from './logError';

describe('logError', () => {
  it('does not log in Node', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError('An error occurred');
    expect(spy).not.toHaveBeenCalled();
  });
});
