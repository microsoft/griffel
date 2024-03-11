import { padding } from './padding';

describe('padding', () => {
  it('for a given value', () => {
    expect(padding('12px')).toEqual({
      padding: '12px',
    });
  });

  it('for given vertical and horizontal values', () => {
    expect(padding('12px', '24px')).toEqual({
      padding: '12px 24px',
    });
  });

  it('for given top, horizontal and bottom values', () => {
    expect(padding('12px', '24px', '36px')).toEqual({
      padding: '12px 24px 36px',
    });
  });

  it('for given top, right, bottom and left values', () => {
    expect(padding('12px', '24px', '36px', '48px')).toEqual({
      padding: '12px 24px 36px 48px',
    });
  });

  it('for a given zero value', () => {
    expect(padding(0)).toEqual({
      padding: 0,
    });
  });

  it('for fallback value arrays', () => {
    expect(padding([0, '12px'], ['2em', '2px'], 'auto')).toEqual({
      paddingBottom: 'auto',
      paddingLeft: ['2em', '2px'],
      paddingRight: ['2em', '2px'],
      paddingTop: [0, '12px'],
    });
  });
});
