import { assignShorthandPriority } from './assignShorthandPriority';
import { type CSSShorthands } from './types';

describe('assignPriority', () => {
  it('should not touch flat properties', () => {
    const shorthandProperties: CSSShorthands = {
      margin: [-1, ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']],
      padding: [-1, ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']],
    };

    expect(assignShorthandPriority(shorthandProperties)).toEqual(shorthandProperties);
  });

  it('should assign priority to nested properties', () => {
    const shorthandProperties: CSSShorthands = {
      border: [
        -1,
        [
          'borderTopWidth',
          'borderTopStyle',
          'borderTopColor',
          'borderTop',
          'borderRight',
          'borderBottom',
          'borderLeftWidth',
          'borderLeftStyle',
          'borderLeftColor',
          'borderLeft',
        ],
      ],
      borderLeft: [-1, ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor']],
      borderTop: [-1, ['borderTopWidth', 'borderTopStyle', 'borderTopColor']],
    };

    expect(assignShorthandPriority(shorthandProperties)).toEqual({
      border: [
        -2,
        [
          'borderTopWidth',
          'borderTopStyle',
          'borderTopColor',
          'borderTop',
          'borderRight',
          'borderBottom',
          'borderLeftWidth',
          'borderLeftStyle',
          'borderLeftColor',
          'borderLeft',
        ],
      ],
      borderLeft: [-1, ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor']],
      borderTop: [-1, ['borderTopWidth', 'borderTopStyle', 'borderTopColor']],
    });
  });
});
