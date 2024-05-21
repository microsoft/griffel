import { hashPropertyKey } from './hashPropertyKey';

const defaultAtRules = { container: '', media: '', supports: '', layer: '' };

describe('hashPropertyKey', () => {
  it('generates hashes that always start with letters', () => {
    expect(hashPropertyKey('', 'color', defaultAtRules)).toBe('sj55zd');
    expect(hashPropertyKey('', 'display', defaultAtRules)).toBe('mc9l5x');

    expect(hashPropertyKey('', 'backgroundColor', defaultAtRules)).toBe('De3pzq');
    expect(hashPropertyKey(':hover', 'color', defaultAtRules)).toBe('Bi91k9c');
  });

  it('generates non-colliding hashes', () => {
    const hashA = hashPropertyKey('', 'color', { ...defaultAtRules, container: '(min-width: 500px)' });
    const hashB = hashPropertyKey('', 'color', { ...defaultAtRules, media: '(min-width: 500px)' });

    expect(hashA).toMatchInlineSnapshot(`"Bhkzl7a"`);
    expect(hashB).toMatchInlineSnapshot(`"B3v6anr"`);
    expect(hashA).not.toBe(hashB);
  });
});
