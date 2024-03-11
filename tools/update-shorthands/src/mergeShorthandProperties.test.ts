import { mergeShorthandProperties } from './mergeShorthandProperties';
import { type CSSShorthands } from './types';

describe('mergeShorthandProperties', () => {
  it('should not merge flat properties', () => {
    const shorthandProperties: CSSShorthands = {
      margin: [-1, ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']],
      padding: [-1, ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']],
    };

    expect(mergeShorthandProperties(shorthandProperties)).toEqual(shorthandProperties);
  });

  it('should merge nested properties', () => {
    const shorthandProperties: CSSShorthands = {
      border: [-1, []],
      borderLeft: [-1, ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor']],
      borderTop: [-1, ['borderTopWidth', 'borderTopStyle', 'borderTopColor']],
    };

    expect(mergeShorthandProperties(shorthandProperties)).toEqual({
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
    });
  });
});
