import { margin } from './margin';

describe('margin', () => {
  it('for a given value', () => {
    expect(margin('12px')).toEqual({
      margin: '12px',
    });
  });

  it('for given vertical and horizontal values', () => {
    expect(margin('12px', '24px')).toEqual({
      margin: '12px 24px',
    });
  });

  it('for given top, horizontal and bottom values', () => {
    expect(margin('12px', '24px', '36px')).toEqual({
      margin: '12px 24px 36px',
    });
  });

  it('for given top, right, bottom and left values', () => {
    expect(margin('12px', '24px', '36px', '48px')).toEqual({
      margin: '12px 24px 36px 48px',
    });
  });

  it('for a given zero value', () => {
    expect(margin(0)).toEqual({
      margin: 0,
    });
  });

  it('for fallback value arrays', () => {
    expect(margin([0, '12px'], ['auto', '-2px'])).toEqual({
      marginBottom: [0, '12px'],
      marginLeft: ['auto', '-2px'],
      marginRight: ['auto', '-2px'],
      marginTop: [0, '12px'],
    });
  });
});
