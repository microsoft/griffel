import { describe, it, expect, vi } from 'vitest';
import { logError } from './logError';

describe('logError', () => {
  it('logs in browser env', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError('An error occurred');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('An error occurred');
  });
});
