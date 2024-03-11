import { reduceToClassName } from './reduceToClassNameForSlots';
import type { CSSClassesMap } from '../types';

describe('reduceToClassName', () => {
  it('should compute class string', () => {
    const classMap: CSSClassesMap = {
      propHashA: 'classA',
      propHashB: 'classB',
    };

    const [className, hash] = reduceToClassName(classMap, 'ltr');

    expect(className).toEqual('classA classB');
    expect(hash).toEqual('classA classB');
  });

  it('handles LTR and RTL class names', () => {
    const classMap: CSSClassesMap = {
      propHashA: ['classA', 'classB'],
    };

    expect(reduceToClassName(classMap, 'ltr')).toEqual(['classA', 'classA']);
    expect(reduceToClassName(classMap, 'rtl')).toEqual(['classB', 'classB']);
  });

  it('handles null class names', () => {
    const classMapA: CSSClassesMap = {
      propHash: null,
    };
    const classMapB: CSSClassesMap = {
      propHashA: 'classA',
      propHashB: null,
      propHashC: 'classC',
    };

    expect(reduceToClassName(classMapA, 'ltr')).toEqual(['', 'propHashnull']);
    expect(reduceToClassName(classMapB, 'ltr')).toEqual(['classA classC', 'classA propHashBnullclassC']);
  });
});
