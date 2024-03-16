import { borderWidth } from './borderWidth';

describe('borderWidth', () => {
  it('for a given value', () => {
    expect(borderWidth('12px')).toEqual({
      borderWidth: '12px',
    });
  });

  it('for given vertical and horizontal values', () => {
    expect(borderWidth('12px', '24px')).toEqual({
      borderWidth: '12px 24px',
    });
  });

  it('for given top, horizontal and bottom values', () => {
    expect(borderWidth('12px', '24px', '36px')).toEqual({
      borderWidth: '12px 24px 36px',
    });
  });

  it('for given top, right, bottom and left values', () => {
    expect(borderWidth('12px', '24px', '36px', '48px')).toEqual({
      borderWidth: '12px 24px 36px 48px',
    });
  });

  it('for a given zero value', () => {
    expect(borderWidth(0)).toEqual({
      borderWidth: 0,
    });
  });

  it('for fallback value arrays', () => {
    expect(borderWidth(['12px', 'initial'], ['24px', 0], ['36px', 'thin'], ['48px', '2em'])).toEqual({
      borderBottomWidth: ['36px', 'thin'],
      borderLeftWidth: ['48px', '2em'],
      borderRightWidth: ['24px', 0],
      borderTopWidth: ['12px', 'initial'],
    });
  });
});
