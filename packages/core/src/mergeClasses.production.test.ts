import { createDOMRenderer } from './renderer/createDOMRenderer';
import { MakeStylesOptions, StylesBySlots } from './types';

/**
 * Reason for isolateModules:
 * jest sets NODE_ENV on startup. Both mergeClasses and makeStyles imports constant SEQUENCE_SIZE,
 * which has different value on prod/non-prod environment.
 * When testing on production, we need to reload both mergeClasses and makeStyles.
 */
let mergeClasses: (...classNames: (string | false | undefined)[]) => string;
let makeStyles: <Slots extends string | number>(
  stylesBySlots: StylesBySlots<Slots>,
) => (options: MakeStylesOptions) => Record<Slots, string>;
jest.isolateModules(() => {
  process.env.NODE_ENV = 'production';
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mergeClasses = require('./mergeClasses').mergeClasses;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  makeStyles = require('./makeStyles').makeStyles;
});

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

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

    expect(mergeClasses(classes.block, classes.flex, classes.grid, classes.padding)).toBe(resultClassName);
  });

  it('order of classes is not important', () => {
    console.log('test start');

    const className = makeStyles({ root: { display: 'block' } })(options).root;

    expect(mergeClasses('ui-button', className, 'ui-button-content')).toBe(`ui-button ui-button-content ${className}`);
  });

  it('order of classes is not important for multilevel overrides', () => {
    const className1 = mergeClasses(
      'ui-button',
      makeStyles({ root: { display: 'block' } })(options).root,
      'ui-button-content',
    );
    const className2 = makeStyles({ root: { display: 'grid' } })(options).root;

    expect(mergeClasses(className1, className2)).toBe(`ui-button ui-button-content ${className2}`);
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

    expect(sequence1).toBe(`ui-button ${className2}`);
    expect(sequence2).toBe('ui-flex ___nsiv7r0 f13qh94s f15vdbe4');
    expect(sequence3).toBe('ui-button ui-flex ___ma4nwa0 f13qh94s f15vdbe4 f1rqyxcv');
  });

  describe('"dir" option', () => {
    it('performs deduplication for RTL classes', () => {
      const computeClasses = makeStyles({
        start: { borderLeftWidth: '5px', borderRightWidth: '5px' },
        end: { borderRightWidth: '5px' },
      });

      const rtlClasses1 = computeClasses({ ...options, dir: 'rtl' });
      const rtlClasses2 = computeClasses({ ...options, dir: 'rtl' });

      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start)).toBe(rtlClasses1.start);
      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start)).toBe(rtlClasses2.start);

      expect(mergeClasses(rtlClasses1.start, rtlClasses2.start, rtlClasses1.end, rtlClasses2.end)).toBe(
        '___1soy3ld f93e62u fo2qazs',
      );
    });

    it('merges multi-level overrides properly', () => {
      const classes = makeStyles({
        block: { display: 'block' },
        grid: { display: 'grid' },
      })({ ...options, dir: 'rtl' });

      const sequence1 = mergeClasses('ui-button', classes.block);
      const sequence2 = mergeClasses(sequence1, classes.grid);

      expect(sequence2).toBe(`ui-button ${classes.grid}`);
    });

    it('classes for different text directions should not collide', () => {
      const computeClasses1 = makeStyles({ root: { color: 'red' } });
      const computeClasses2 = makeStyles({ root: { paddingLeft: '10px' } });

      const ltrClassName1 = computeClasses1(options).root;
      const ltrClassName2 = computeClasses2(options).root;

      const rtlClassName1 = computeClasses1({ ...options, dir: 'rtl' }).root;
      const rtlClassName2 = computeClasses2({ ...options, dir: 'rtl' }).root;

      expect(mergeClasses(ltrClassName1, ltrClassName2)).toBe('___1t65jhk fe3e8s9 frdkuqy');
      expect(mergeClasses(rtlClassName1, rtlClassName2)).toBe('___w1tqsn0 fe3e8s9 f81rol6');
    });
  });
});
