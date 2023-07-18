import { validateArguments } from './utils';

describe('validateArguments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs errors on a single argument that contains spacing', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    validateArguments('padding', ['0px 0px']);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/You are using unsupported value for the shorthand CSS function/),
    );
  });

  it('does not log errors in valid scenarios', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    validateArguments('padding', [' 0px  ']);
    validateArguments('padding', ['0px', '0px']);

    expect(spy).not.toBeCalled();
  });
});
