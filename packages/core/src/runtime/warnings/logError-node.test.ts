/*
 * @jest-environment node
 */

import { logError } from './logError';

describe('logError', () => {
  it('does not log in Node', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    logError('An error occurred');
    expect(spy).not.toHaveBeenCalled();
  });
});
