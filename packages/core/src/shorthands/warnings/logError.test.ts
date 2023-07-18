import { logError } from './logError';

describe('logError', () => {
  it('logs in browser env', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    logError('An error occurred');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('An error occurred');
  });
});
