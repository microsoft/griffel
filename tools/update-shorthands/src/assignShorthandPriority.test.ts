import { assignShorthandPriority } from './assignShorthandPriority';

describe('assignPriority', () => {
  it('should not touch flat properties', () => {
    const preparedProperties = {
      margin: ['marginBottom', 'marginLeft', 'marginRight', 'marginTop'],
      padding: ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'],
    };

    expect(assignShorthandPriority(preparedProperties)).toEqual({
      margin: [-1, ['marginBottom', 'marginLeft', 'marginRight', 'marginTop']],
      padding: [-1, ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop']],
    });
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
