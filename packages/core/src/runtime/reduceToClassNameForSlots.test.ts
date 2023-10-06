import { reduceToClassName, reduceToClassNameForSlots } from './reduceToClassNameForSlots';
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

  it('handles "null" values', () => {
    const classMapA: CSSClassesMap = {
      propHash: null,
    };
    const classMapB: CSSClassesMap = {
      propHashA: 'classA',
      propHashB: null,
      propHashC: 'classC',
    };

    expect(reduceToClassName(classMapA, 'ltr')).toEqual(['', 'propHash']);
    expect(reduceToClassName(classMapB, 'ltr')).toEqual(['classA classC', 'classA propHashB classC']);
  });
});

describe('reduceToClassNameForSlots', () => {
  it('should compute class strings for slots', () => {
    const classesMapBySlot = {
      slotA: {
        propHashA: 'classA',
      },
      slotB: {
        propHashB1: 'classB1',
        propHashB2: 'classB2',
      },
      slotC: {},
    };

    expect(reduceToClassNameForSlots(classesMapBySlot, 'ltr')).toEqual({
      slotA: '___a84her0_0000000 classA',
      slotB: '___10oe011_0000000 classB1 classB2',
      slotC: '',
    });
  });

  it('handles "null"', () => {
    const classesMapBySlot = {
      slotA: {
        propHashA: null,
      },
      slotB: {
        propHashA: null,
        propHashB: 'classB',
      },
      slotC: {
        propHashC: null,
      },
    };
    const result = reduceToClassNameForSlots(classesMapBySlot, 'ltr');

    expect(result.slotA).not.toEqual(result.slotB);
    expect(result.slotA).not.toEqual(result.slotC);
    expect(result.slotB).not.toEqual(result.slotC);

    expect(result).toEqual({
      slotA: '___1emulr0_0000000',
      slotB: '___1enpbr2_0000000 classB',
      slotC: '___1x83fpy_0000000',
    });
  });
});
