import { RESET } from '../../constants';
import { isResetValue } from './isResetValue';

describe('isResetValue', () => {
  it('returns "true" for reset style value', () => {
    expect(isResetValue(RESET)).toBe(true);
  });

  it('returns "false" for non-reset style value', () => {
    expect(isResetValue('red')).toBe(false);
    expect(isResetValue(0)).toBe(false);

    expect(isResetValue({ color: 'red' })).toBe(false);
    expect(isResetValue({ ':hover': { color: 'red' } })).toBe(false);
  });
});
