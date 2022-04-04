import { mergeClasses } from './mergeClasses';
import { makeStyles } from './makeStyles';
import { createDOMRenderer } from './renderer/createDOMRenderer';
import { MakeStylesOptions } from './types';
import { SEQUENCE_PREFIX } from './constants';

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

const EMPTY_STRING_HASH = '0000000';

describe('mergeClasses', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('handles non makeStyles classes', () => {
    expect(mergeClasses('ui-button')).toBe('ui-button');
    expect(mergeClasses('ui-button', 'ui-button-content')).toBe('ui-button ui-button-content');
  });

  it('handles classes from CSS modules', () => {
    expect(mergeClasses('_src_Button_module__primary')).toBe('_src_Button_module__primary');
    expect(mergeClasses('Button_primary__XXP8s')).toBe('Button_primary__XXP8s');

    expect(mergeClasses('Button_primary__XXP8b Button_primary__XXP8s')).toBe(
      'Button_primary__XXP8b Button_primary__XXP8s',
    );
  });

  it('handles empty params', () => {
    expect(mergeClasses('ui-button', undefined)).toBe('ui-button');
    expect(mergeClasses(undefined, false)).toBe('');
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
      resultClassName.replace(EMPTY_STRING_HASH, '128vz1a'),
    );
  });

  it('order of classes is not important', () => {
    const className = makeStyles({ root: { display: 'block' } })(options).root;

    expect(mergeClasses('ui-button', className, 'ui-button-content')).toBe(
      `ui-button ui-button-content ${className.replace(EMPTY_STRING_HASH, '1baslyg')}`,
    );
  });

  it('order of classes is not important for multilevel overrides', () => {
    const className1 = mergeClasses(
      'ui-button',
      makeStyles({ root: { display: 'block' } })(options).root,
      'ui-button-content',
    );
    const className2 = makeStyles({ root: { display: 'grid' } })(options).root;

    expect(mergeClasses(className1, className2)).toBe(
      `ui-button ui-button-content ${className2.replace(EMPTY_STRING_HASH, '2zfpac0')}`,
    );
  });

  it('merges multi-level overrides properly', () => {
    const className1 = makeStyles({ root: { display: 'block' } })(options).root;
    const className2 = makeStyles({ root: { display: 'flex' } })(options).root;

    const sequence1 = mergeClasses('ui-button', className1, className2);

    const className3 = makeStyles({ root: { display: 'grid' } })(options).root;
    const className4 = makeStyles({ root: { paddingLeft: '5px' } })(options).root;
    const className5 = makeStyles({ root: { marginTop: '5px' } })(options).root;

    const sequence2 = mergeClasses('ui-flex', className3, className4);
    const sequence3 = mergeClasses(sequence1, sequence2, className5);

    expect(sequence1).toBe(`ui-button ${className2.replace(EMPTY_STRING_HASH, '39qb7g0')}`);
    expect(sequence2).toBe('ui-flex ___nsiv7r0_1gcq9os f13qh94s f15vdbe4');
    expect(sequence3).toBe('ui-button ui-flex ___ma4nwa0_108wpwe f13qh94s f15vdbe4 f1rqyxcv');
  });

  it('warns if an unregistered sequence was passed', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const error = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    const className = makeStyles({ root: { display: 'block' } })(options).root;

    expect(mergeClasses(className, `${SEQUENCE_PREFIX}abcdefg_0000000 oprsqrt`)).toBe(
      className.replace(EMPTY_STRING_HASH, 'a463jz0'),
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

      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start)).toBe(
        rtlClasses1.start.replace(EMPTY_STRING_HASH, '1s7zert'),
      );
      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start)).toBe(
        rtlClasses2.start.replace(EMPTY_STRING_HASH, '1s7zert'),
      );

      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start, rtlClasses1.end, rtlClasses2.end)).toBe(
        '___1soy3ld_3knmyj0 f93e62u fo2qazs',
      );
    });

    it('merges multi-level overrides properly', () => {
      const classes = makeStyles({
        block: { display: 'block' },
        grid: { display: 'grid' },
      })({ ...options, dir: 'rtl' });

      const sequence1 = mergeClasses('ui-button', classes.block);
      const sequence2 = mergeClasses(sequence1, classes.grid);

      expect(sequence2).toBe(`ui-button ${classes.grid.replace(EMPTY_STRING_HASH, '1y0ptz9')}`);
    });

    it('classes for different text directions should not collide', () => {
      const computeClasses1 = makeStyles({ root: { color: 'red' } });
      const computeClasses2 = makeStyles({ root: { paddingLeft: '10px' } });

      const ltrClassName1 = computeClasses1(options).root;
      const ltrClassName2 = computeClasses2(options).root;

      const rtlClassName1 = computeClasses1({ ...options, dir: 'rtl' }).root;
      const rtlClassName2 = computeClasses2({ ...options, dir: 'rtl' }).root;

      expect(mergeClasses(ltrClassName1, ltrClassName2)).toBe('___1t65jhk_lct7tf0 fe3e8s9 frdkuqy');
      expect(mergeClasses(rtlClassName1, rtlClassName2)).toBe('___w1tqsn0_xvdpx10 fe3e8s9 f81rol6');
    });
  });
});
