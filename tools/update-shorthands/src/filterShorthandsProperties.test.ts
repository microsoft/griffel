import { filterShorthandsProperties } from './filterShorthandsProperties';
import { type MdnData } from './types';

describe('filterShorthandsProperties', () => {
  it('should filter out vendor properties and obsolete properties', () => {
    const data: MdnData = {
      border: {
        computed: ['border-width', 'border-style', 'border-color'],
        status: 'standard',
      },
      'border-color': {
        computed: ['border-color-top'],
        status: 'standard',
      },
      margin: {
        computed: ['margin-top'],
        status: 'standard',
      },
      '-webkit-appearance': {
        computed: ['-webkit-appearance'],
        status: 'standard',
      },
      'scroll-snap-coordinat': {
        computed: 'asSpecifiedRelativeToAbsoluteLengths',
        status: 'obsolete',
      },
    };

    expect(filterShorthandsProperties(data)).toEqual({
      border: {
        computed: [],
        status: 'standard',
      },
      margin: {
        computed: ['margin-top'],
        status: 'standard',
      },
    });
  });
});
