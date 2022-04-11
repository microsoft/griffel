import { mergeClasses } from './mergeClasses';
import { makeStyles } from './makeStyles';
import { createDOMRenderer } from './renderer/createDOMRenderer';
import { MakeStylesOptions } from './types';
import { SEQUENCE_PREFIX } from './constants';

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

describe('mergeClasses', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('performs deduplication for multiple arguments', () => {
    const classes = makeStyles({
      block: { display: 'block' },
      flex: { display: 'flex' },
      grid: { display: 'grid' },
      padding: { paddingLeft: '5px' },
    })(options);

    const resultClassName = makeStyles({ root: { display: 'grid', paddingLeft: '5px' } })(options).root;
    expect(mergeClasses(classes.block, classes.flex, classes.grid, classes.padding)).toBe(
      resultClassName.replace('0000000', '128vz1a'),
    );
  });

  it('warns if an unregistered sequence was passed', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const error = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    const className = makeStyles({ root: { display: 'block' } })(options).root;

    expect(mergeClasses(className, `${SEQUENCE_PREFIX}abcdefg_0000000 oprsqrt`)).toBe(
      className.replace('0000000', 'a463jz0'),
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/passed string contains an identifier \(___abcdefg_0000000\)/),
    );
  });

  it('warns if strings are not properly merged', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const error = jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    const className1 = makeStyles({ root: { display: 'block' } })(options).root;
    const className2 = makeStyles({ root: { display: 'flex' } })(options).root;

    mergeClasses(className1 + ' ' + className2);

    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/a passed string contains multiple identifiers of atomic classes/),
    );
  });

  it('warns if classes with different directions are passed', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const error = jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    const ltrClassName = makeStyles({ root: { display: 'block' } })(options).root;
    const rtlClassName = makeStyles({ root: { display: 'flex' } })({ ...options, dir: 'rtl' }).root;

    mergeClasses(ltrClassName, rtlClassName);
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/that has different direction \(dir="rtl"\)/));
  });

  describe('"dir" option', () => {
    it('performs deduplication for RTL classes', () => {
      const computeClasses = makeStyles({
        start: { borderLeftWidth: '5px', borderRightWidth: '5px' },
        end: { borderRightWidth: '5px' },
      });

      const rtlClasses1 = computeClasses({ ...options, dir: 'rtl' });
      const rtlClasses2 = computeClasses({ ...options, dir: 'rtl' });
      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start)).toBe(rtlClasses1.start.replace('0000000', '1s7zert'));
      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start)).toBe(rtlClasses2.start.replace('0000000', '1s7zert'));

      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start, rtlClasses1.end, rtlClasses2.end)).toBe(
        '___1soy3ld_3knmyj0 f93e62u fo2qazs',
      );
    });
  });
});
