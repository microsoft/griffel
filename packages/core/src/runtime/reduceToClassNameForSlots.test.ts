import { reduceToClassName } from './reduceToClassNameForSlots';
import type { CSSClassesMap } from '../types';

describe('reduceToClassName', () => {
  it('should compute class string', () => {
    const classMap: CSSClassesMap = {
      propHashA: 'classA',
      propHashB: 'classB',
    };

    const className = reduceToClassName(classMap, 'ltr');

    expect(className).toEqual('classA classB');
  });

  it('handles LTR and RTL class names', () => {
    const classMap: CSSClassesMap = {
      propHashA: ['classA', 'classB'],
    };

    expect(reduceToClassName(classMap, 'ltr')).toEqual('classA');
    expect(reduceToClassName(classMap, 'rtl')).toEqual('classB');
  });
});
