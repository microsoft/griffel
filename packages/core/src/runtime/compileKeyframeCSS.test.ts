import { compileKeyframeRule, compileKeyframesCSS } from './compileKeyframeCSS';
import { GriffelAnimation } from '../types';

describe('compileKeyframeRule', () => {
  it('stringifies an object with keyframes', () => {
    const keyframes: GriffelAnimation = {
      from: {
        transform: 'rotate(0deg)',
      },
      to: {
        transform: 'rotate(360deg)',
      },
    };
    const result = compileKeyframeRule(keyframes);

    expect(result).toMatchInlineSnapshot(`"from{transform:rotate(0deg);}to{transform:rotate(360deg);}"`);
  });
});

describe('compileKeyframeCSS', () => {
  it('creates CSS from strings with keyframes', () => {
    const keyframes: GriffelAnimation = {
      from: {
        height: '10px',
      },
      to: {
        height: '50px',
      },
    };
    const keyframesCSS = compileKeyframeRule(keyframes);
    const result = compileKeyframesCSS('foo', keyframesCSS);

    expect(result).toMatchInlineSnapshot(`
      Array [
        "@-webkit-keyframes foo{from{height:10px;}to{height:50px;}}",
        "@keyframes foo{from{height:10px;}to{height:50px;}}",
      ]
    `);
  });
});
