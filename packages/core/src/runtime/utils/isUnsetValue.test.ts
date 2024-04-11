import { UNSET } from '../../constants';
import { isUnsetValue } from './isUnsetValue';

describe('isResetStyleValue', () => {
  it('returns "true" for reset style value', () => {
    expect(isUnsetValue(UNSET)).toBe(true);
  });

  it('returns "false" for non-reset style value', () => {
    expect(isUnsetValue('red')).toBe(false);
    expect(isUnsetValue(0)).toBe(false);

    expect(isUnsetValue({ color: 'red' })).toBe(false);
    expect(isUnsetValue({ ':hover': { color: 'red' } })).toBe(false);
  });
});
