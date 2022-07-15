import { gridArea } from './gridArea';

describe('gridArea(all)', () => {
  it('for auto', () => {
    expect(gridArea('auto')).toEqual({
      gridRowStart: 'auto',
      gridColumnStart: 'auto',
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });

  it('for custom-ident', () => {
    expect(gridArea('header')).toEqual({
      gridRowStart: 'header',
      gridColumnStart: 'header',
      gridRowEnd: 'header',
      gridColumnEnd: 'header',
    });
  });

  it('for number', () => {
    expect(gridArea(2)).toEqual({
      gridRowStart: 2,
      gridColumnStart: 'auto',
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });

  it('for span number', () => {
    expect(gridArea('span 3')).toEqual({
      gridRowStart: 'span 3',
      gridColumnStart: 'auto',
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });

  it('for span custom-ident', () => {
    expect(gridArea('span header')).toEqual({
      gridRowStart: 'span header',
      gridColumnStart: 'auto',
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });
});

describe('gridArea(rowStart, columnStart)', () => {
  it('for auto', () => {
    expect(gridArea('auto', 'auto')).toEqual({
      gridRowStart: 'auto',
      gridColumnStart: 'auto',
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });

  it('for custom-ident', () => {
    expect(gridArea('header', 'footer')).toEqual({
      gridRowStart: 'header',
      gridColumnStart: 'footer',
      gridRowEnd: 'header',
      gridColumnEnd: 'footer',
    });
  });

  it('for number', () => {
    expect(gridArea(2, 4)).toEqual({
      gridRowStart: 2,
      gridColumnStart: 4,
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });

  it('for span number', () => {
    expect(gridArea(3, 'span 2')).toEqual({
      gridRowStart: 3,
      gridColumnStart: 'span 2',
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });

  it('for span custom-ident', () => {
    expect(gridArea('header', 'span footer')).toEqual({
      gridRowStart: 'header',
      gridColumnStart: 'span footer',
      gridRowEnd: 'header',
      gridColumnEnd: 'auto',
    });
  });
});

describe('gridArea(rowStart, columnStart, rowEnd)', () => {
  it('for auto', () => {
    expect(gridArea('auto', 'auto', 'auto')).toEqual({
      gridRowStart: 'auto',
      gridColumnStart: 'auto',
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });

  it('for custom-ident', () => {
    expect(gridArea(2, 1, 'footer')).toEqual({
      gridRowStart: 2,
      gridColumnStart: 1,
      gridRowEnd: 'footer',
      gridColumnEnd: 'auto',
    });
  });

  it('for number', () => {
    expect(gridArea(2, 4, 3)).toEqual({
      gridRowStart: 2,
      gridColumnStart: 4,
      gridRowEnd: 3,
      gridColumnEnd: 'auto',
    });
  });

  it('for span number', () => {
    expect(gridArea('header', 2, 'span 2')).toEqual({
      gridRowStart: 'header',
      gridColumnStart: 2,
      gridRowEnd: 'span 2',
      gridColumnEnd: 'auto',
    });
  });

  it('for span custom-ident', () => {
    expect(gridArea('header', 'span body', 'span footer')).toEqual({
      gridRowStart: 'header',
      gridColumnStart: 'span body',
      gridRowEnd: 'span footer',
      gridColumnEnd: 'auto',
    });
  });
});

describe('gridArea(rowStart, columnStart, rowEnd, columnEnd)', () => {
  it('for auto', () => {
    expect(gridArea('auto', 'auto', 'auto', 'auto')).toEqual({
      gridRowStart: 'auto',
      gridColumnStart: 'auto',
      gridRowEnd: 'auto',
      gridColumnEnd: 'auto',
    });
  });

  it('for custom-ident', () => {
    expect(gridArea('a', 'b', 'c', 'd')).toEqual({
      gridRowStart: 'a',
      gridColumnStart: 'b',
      gridRowEnd: 'c',
      gridColumnEnd: 'd',
    });
  });

  it('for number', () => {
    expect(gridArea(2, 4, 3, 1)).toEqual({
      gridRowStart: 2,
      gridColumnStart: 4,
      gridRowEnd: 3,
      gridColumnEnd: 1,
    });
  });

  it('for span number', () => {
    expect(gridArea('span 1', 'span 2', 'span 3', 'span 4')).toEqual({
      gridRowStart: 'span 1',
      gridColumnStart: 'span 2',
      gridRowEnd: 'span 3',
      gridColumnEnd: 'span 4',
    });
  });

  it('for span custom-ident', () => {
    expect(gridArea('span header', 'span first', 'span footer', 'span last')).toEqual({
      gridRowStart: 'span header',
      gridColumnStart: 'span first',
      gridRowEnd: 'span footer',
      gridColumnEnd: 'span last',
    });
  });

  it('for mixture', () => {
    expect(gridArea('auto', 3, 'footer', 'span 2')).toEqual({
      gridRowStart: 'auto',
      gridColumnStart: 3,
      gridRowEnd: 'footer',
      gridColumnEnd: 'span 2',
    });
  });

  it('for css var reference', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(gridArea('header', 'header', 'var(--my-var)', 'header')).toEqual({});

    jest.spyOn(console, 'error').mockClear();
  });

  it('for css var reference within string', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(gridArea('header', 'header', 'header var(--my-var) header', 'header')).toEqual({});

    jest.spyOn(console, 'error').mockClear();
  });

  it('for empty css var reference', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(gridArea('header', 'header', 'var()', 'header')).toEqual({});

    jest.spyOn(console, 'error').mockClear();
  });
});
