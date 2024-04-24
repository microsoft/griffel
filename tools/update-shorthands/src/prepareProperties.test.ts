import { prepareProperties } from './prepareProperties';

describe('mergeShorthandProperties', () => {
  it('should not merge flat properties', () => {
    const shorthandsData = {
      margin: {
        computed: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
        status: 'standard' as const,
      },
      padding: {
        computed: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
        status: 'standard' as const,
      },
    };

    expect(prepareProperties(shorthandsData)).toEqual({
      margin: ['marginBottom', 'marginLeft', 'marginRight', 'marginTop'],
      padding: ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'],
    });
  });

  it('should merge nested properties', () => {
    const shorthandsData = {
      border: {
        computed: [],
        status: 'standard' as const,
      },
      borderLeft: {
        computed: ['border-left-width', 'border-left-style', 'border-left-color'],
        status: 'standard' as const,
      },
      borderTop: {
        computed: ['border-top-width', 'border-top-style', 'border-top-color'],
        status: 'standard' as const,
      },
    };

    expect(prepareProperties(shorthandsData)).toEqual({
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
    });
  });
});
