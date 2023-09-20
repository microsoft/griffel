import { trimSelector } from './trimSelector';

describe('trimSelector', () => {
  it('trims ">"', () => {
    expect(trimSelector('>.foo')).toBe('>.foo');
    expect(trimSelector('> .foo')).toBe('>.foo');
    expect(trimSelector('>  .foo')).toBe('>.foo');

    expect(trimSelector('> .foo > .bar')).toBe('>.foo >.bar');
  });
});
