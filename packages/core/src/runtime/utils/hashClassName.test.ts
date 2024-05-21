import { hashClassName } from './hashClassName';

const defaultOptions = {
  property: 'color',
  selector: '',
  value: 'red',

  salt: '',
};
const defaultAtRules = {
  container: '',
  media: '',
  layer: '',
  supports: '',
};

describe('hashClassName', () => {
  it('should hash the className', () => {
    expect(hashClassName(defaultOptions, defaultAtRules)).toMatchInlineSnapshot(`"fe3e8s9"`);
  });

  it('should generate non-colliding hashes', () => {
    const hashA = hashClassName(defaultOptions, { ...defaultAtRules, container: '(min-width: 500px)' });
    const hashB = hashClassName(defaultOptions, { ...defaultAtRules, media: '(min-width: 500px)' });

    expect(hashA).toMatchInlineSnapshot(`"f18ymuke"`);
    expect(hashB).toMatchInlineSnapshot(`"f16oyr76"`);
    expect(hashA).not.toBe(hashB);
  });

  it('should use salt for hash', () => {
    const withoutSalt = hashClassName(defaultOptions, defaultAtRules);
    const withSalt = hashClassName({ ...defaultOptions, salt: 'HASH_SALT' }, defaultAtRules);

    expect(withoutSalt).not.toEqual(withSalt);

    expect(withoutSalt).toMatchInlineSnapshot(`"fe3e8s9"`);
    expect(withSalt).toMatchInlineSnapshot(`"f3mwu0g"`);
  });
});
