import { flex } from './flex';

describe('flex', () => {
  it('for a given value auto', () => {
    expect(flex('auto')).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 'auto',
    });
  });

  it('for a given value initial', () => {
    expect(flex('initial')).toEqual({
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: 'auto',
    });
  });

  it('for a given value none', () => {
    expect(flex('none')).toEqual({
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 'auto',
    });
  });

  it('for a given value 2', () => {
    expect(flex(2)).toEqual({
      flexGrow: 2,
      flexShrink: 1,
      flexBasis: 0,
    });
  });

  it('for a given value 10em', () => {
    expect(flex('10em')).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '10em',
    });
  });

  it('for a given value 30%', () => {
    expect(flex('30%')).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '30%',
    });
  });

  it('for a given value min-content', () => {
    expect(flex('min-content')).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 'min-content',
    });
  });

  it('for a given values 1, 30px', () => {
    expect(flex(1, '30px')).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '30px',
    });
  });

  it('for a given values 2, 2', () => {
    expect(flex(2, 2)).toEqual({
      flexGrow: 2,
      flexShrink: 2,
      flexBasis: 0,
    });
  });

  it('for a given values 2 2 10%;', () => {
    expect(flex(2, 2, '10%')).toEqual({
      flexGrow: 2,
      flexShrink: 2,
      flexBasis: '10%',
    });
  });

  it('for a given values 0, 0, auto', () => {
    expect(flex(0, 0, 'auto')).toEqual({
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 'auto',
    });
  });

  it('for a given values 1, 1, 10rem', () => {
    expect(flex(1, 1, '10rem')).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '10rem',
    });
  });
});
