import { type GriffelStyle } from '@griffel/style-types';
import { borderBottom } from './borderBottom';

describe('types tests', () => {
  it('borderBottom', () => {
    type Options = {
      width?: GriffelStyle['borderBottomWidth'];
      style?: GriffelStyle['borderBottomStyle'];
      color?: GriffelStyle['borderBottomColor'];
    };
    const options: Options = {
      width: '2px',
      style: 'solid',
      color: 'red',
    };

    const { width = '1px', style = 'solid', color = 'red' } = options;

    expect(borderBottom(width, style, color)).toEqual({
      borderBottomWidth: '2px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'red',
    });
  });
});
