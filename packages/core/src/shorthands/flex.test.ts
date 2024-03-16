import { flex } from './flex';

describe('flex', () => {
  it('for a given value auto', () => {
    expect(flex('auto')).toEqual({
      flex: 'auto',
    });
  });

  it('for a given value initial', () => {
    expect(flex('initial')).toEqual({
      flex: 'initial',
    });
  });

  it('for a given value none', () => {
    expect(flex('none')).toEqual({
      flex: 'none',
    });
  });

  it('for a given value 2', () => {
    expect(flex(2)).toEqual({
      flex: '2',
    });
  });

  it('for a given value 10em', () => {
    expect(flex('10em')).toEqual({
      flex: '10em',
    });
  });

  it('for a given value 30%', () => {
    expect(flex('30%')).toEqual({
      flex: '30%',
    });
  });

  it('for a given value min-content', () => {
    expect(flex('min-content')).toEqual({
      flex: 'min-content',
    });
  });

  it('for a given values 1, 30px', () => {
    expect(flex(1, '30px')).toEqual({
      flex: '1 30px',
    });
  });

  it('for a given values 2, 2', () => {
    expect(flex(2, 2)).toEqual({
      flex: '2 2',
    });
  });

  it('for a given values 2 2 10%;', () => {
    expect(flex(2, 2, '10%')).toEqual({
      flex: '2 2 10%',
    });
  });

  it('for a given values 0, 0, auto', () => {
    expect(flex(0, 0, 'auto')).toEqual({
      flex: '0 0 auto',
    });
  });

  it('for a given values 1, 1, 10rem', () => {
    expect(flex(1, 1, '10rem')).toEqual({
      flex: '1 1 10rem',
    });
  });
});
