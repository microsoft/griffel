import { hashPropertyKey } from './hashPropertyKey';

describe('hashPropertyKey', () => {
  it('generates hashes that always start with letters', () => {
    const atRules = { container: '', media: '', supports: '', layer: '' };

    expect(hashPropertyKey('', 'color', atRules)).toBe('sj55zd');
    expect(hashPropertyKey('', 'display', atRules)).toBe('mc9l5x');

    expect(hashPropertyKey('', 'backgroundColor', atRules)).toBe('De3pzq');
    expect(hashPropertyKey(':hover', 'color', atRules)).toBe('Bi91k9c');
  });
});
