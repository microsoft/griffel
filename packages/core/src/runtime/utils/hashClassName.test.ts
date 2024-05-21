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

  it('should use salt for hash', () => {
    const withoutSalt = hashClassName(defaultOptions, defaultAtRules);
    const withSalt = hashClassName({ ...defaultOptions, salt: 'HASH_SALT' }, defaultAtRules);

    expect(withoutSalt).not.toEqual(withSalt);

    expect(withoutSalt).toMatchInlineSnapshot(`"fe3e8s9"`);
    expect(withSalt).toMatchInlineSnapshot(`"f3mwu0g"`);
  });
});
