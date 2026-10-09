import { describe, it, expect } from 'vitest';
import { assignShorthandPriority } from './assignShorthandPriority.ts';

describe('assignPriority', () => {
  it('assigns positive priorities to logical padding & margin properties', () => {
    const preparedProperties = {
      margin: ['marginBottom', 'marginLeft', 'marginRight', 'marginTop'],
      marginBlock: ['marginBlockEnd', 'marginBlockStart'],
      marginInline: ['marginInlineEnd', 'marginInlineStart'],
      padding: ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'],
      paddingBlock: ['paddingBlockEnd', 'paddingBlockStart'],
      paddingInline: ['paddingInlineEnd', 'paddingInlineStart'],
    };

    expect(assignShorthandPriority(preparedProperties)).toEqual({
      margin: [-1, ['marginBottom', 'marginLeft', 'marginRight', 'marginTop']],
      padding: [-1, ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop']],
      paddingInline: [1, ['paddingInlineEnd', 'paddingInlineStart']],
      paddingBlock: [1, ['paddingBlockEnd', 'paddingBlockStart']],
      marginInline: [1, ['marginInlineEnd', 'marginInlineStart']],
      marginBlock: [1, ['marginBlockEnd', 'marginBlockStart']],
      paddingInlineEnd: [2, []],
      paddingInlineStart: [2, []],
      paddingBlockEnd: [2, []],
      paddingBlockStart: [2, []],
      marginInlineEnd: [2, []],
      marginInlineStart: [2, []],
      marginBlockEnd: [2, []],
      marginBlockStart: [2, []],
    });
  });

  it('assigns positive priorities to logical inset & scroll properties', () => {
    const preparedProperties = {
      inset: ['bottom', 'left', 'right', 'top'],
      insetBlock: ['insetBlockEnd', 'insetBlockStart'],
      insetInline: ['insetInlineEnd', 'insetInlineStart'],
      scrollPadding: ['scrollPaddingBottom', 'scrollPaddingLeft', 'scrollPaddingRight', 'scrollPaddingTop'],
      scrollPaddingBlock: ['scrollPaddingBlockEnd', 'scrollPaddingBlockStart'],
      scrollPaddingInline: ['scrollPaddingInlineEnd', 'scrollPaddingInlineStart'],
    };

    expect(assignShorthandPriority(preparedProperties)).toEqual({
      inset: [-1, ['bottom', 'left', 'right', 'top']],
      scrollPadding: [-1, ['scrollPaddingBottom', 'scrollPaddingLeft', 'scrollPaddingRight', 'scrollPaddingTop']],
      insetBlock: [1, ['insetBlockEnd', 'insetBlockStart']],
      insetInline: [1, ['insetInlineEnd', 'insetInlineStart']],
      scrollPaddingBlock: [1, ['scrollPaddingBlockEnd', 'scrollPaddingBlockStart']],
      scrollPaddingInline: [1, ['scrollPaddingInlineEnd', 'scrollPaddingInlineStart']],
      insetBlockEnd: [2, []],
      insetBlockStart: [2, []],
      insetInlineEnd: [2, []],
      insetInlineStart: [2, []],
      scrollPaddingBlockEnd: [2, []],
      scrollPaddingBlockStart: [2, []],
      scrollPaddingInlineEnd: [2, []],
      scrollPaddingInlineStart: [2, []],
    });
  });

  it('leaves nested logical shorthands (e.g. logical borders) untouched', () => {
    const preparedProperties = {
      borderBlock: ['borderBlockColor', 'borderBlockEnd', 'borderBlockStart', 'borderBlockStyle', 'borderBlockWidth'],
      borderBlockEnd: ['borderBlockEndColor', 'borderBlockEndStyle', 'borderBlockEndWidth'],
      borderBlockStart: ['borderBlockStartColor', 'borderBlockStartStyle', 'borderBlockStartWidth'],
    };

    const result = assignShorthandPriority(preparedProperties);

    expect(result.borderBlock[0]).toBeLessThan(0);
    expect(result.borderBlockEnd[0]).toBeLessThan(0);
    expect(result.borderBlockStart[0]).toBeLessThan(0);
  });

  it('should assign priority to nested properties', () => {
    const preparedProperties = {
      border: [
        'borderBottom',
        'borderLeft',
        'borderLeftColor',
        'borderLeftStyle',
        'borderLeftWidth',
        'borderRight',
        'borderTop',
        'borderTopColor',
        'borderTopStyle',
        'borderTopWidth',
      ],
      borderLeft: ['borderLeftColor', 'borderLeftStyle', 'borderLeftWidth'],
      borderTop: ['borderTopColor', 'borderTopStyle', 'borderTopWidth'],
    };

    expect(assignShorthandPriority(preparedProperties)).toEqual({
      border: [
        -2,
        [
          'borderBottom',
          'borderLeft',
          'borderLeftColor',
          'borderLeftStyle',
          'borderLeftWidth',
          'borderRight',
          'borderTop',
          'borderTopColor',
          'borderTopStyle',
          'borderTopWidth',
        ],
      ],
      borderLeft: [-1, ['borderLeftColor', 'borderLeftStyle', 'borderLeftWidth']],
      borderTop: [-1, ['borderTopColor', 'borderTopStyle', 'borderTopWidth']],
    });
  });

  it('should assign priority to deeply nested properties', () => {
    const preparedProperties = {
      nestingLevel3: ['nestingLevel2', 'nestingLevel1A', 'nestingLevel1B', 'nestingLevel0A', 'nestingLevel0B'],
      nestingLevel2: ['nestingLevel1A', 'nestingLevel1B', 'nestingLevel0A', 'nestingLevel0B'],
      nestingLevel1A: ['nestingLevel0A', 'nestingLevel0B'],
      nestingLevel1B: ['nestingLevel0A', 'nestingLevel0B'],
    };

    expect(assignShorthandPriority(preparedProperties)).toEqual({
      nestingLevel3: [-3, ['nestingLevel2', 'nestingLevel1A', 'nestingLevel1B', 'nestingLevel0A', 'nestingLevel0B']],
      nestingLevel2: [-2, ['nestingLevel1A', 'nestingLevel1B', 'nestingLevel0A', 'nestingLevel0B']],
      nestingLevel1A: [-1, ['nestingLevel0A', 'nestingLevel0B']],
      nestingLevel1B: [-1, ['nestingLevel0A', 'nestingLevel0B']],
    });
  });
});
