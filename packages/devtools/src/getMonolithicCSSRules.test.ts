import { getMonolithicCSSRules } from './getMonolithicCSSRules';

describe('getMonolithicCSSRules', () => {
  it('group atomic css with class names selector', () => {
    const rules = ['.abcdef0{background-color:red;}', '.abcdef1{color:red;}'].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '': [
        {
          className: 'abcdef0',
          css: 'background-color:red;',
        },
        {
          className: 'abcdef1',
          css: 'color:red;',
        },
      ],
    });
  });

  it('separate atomic css with class names selector and pseudo selector', () => {
    const rules = [
      '.abcdef0{background-color:red;}',
      '.abcdef1{display:block;}',
      '.abcdef2:hover{display:none;}',
      '.abcdef3:hover{color:red;}',
    ].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '': [
        {
          className: 'abcdef0',
          css: 'background-color:red;',
        },
        {
          className: 'abcdef1',
          css: 'display:block;',
        },
      ],
      ':hover': [
        {
          className: 'abcdef2',
          css: 'display:none;',
        },
        {
          className: 'abcdef3',
          css: 'color:red;',
        },
      ],
    });
  });

  it('group atomic css with media selector', () => {
    const rules = [
      '.abcdef0{background-color:red;}',
      '.abcdef1{display:block;}',
      '.abcdef2:hover{display:none;}',
      '.abcdef3:hover{color:red;}',
    ].map(cssRule => ({ cssRule: `@media screen and (max-width: 992px){${cssRule}}` }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '@media screen and (max-width: 992px)': {
        '': [
          {
            className: 'abcdef0',
            css: 'background-color:red;',
          },
          {
            className: 'abcdef1',
            css: 'display:block;',
          },
        ],
        ':hover': [
          {
            className: 'abcdef2',
            css: 'display:none;',
          },
          {
            className: 'abcdef3',
            css: 'color:red;',
          },
        ],
      },
    });
  });

  it('separate atomic css with different media selector', () => {
    const rules = [
      '.abcdef0{background-color:red;}',
      '@media screen and (max-width: 992px){.abcdef0{background-color:blue;}}',
      '@media screen and (max-width: 1024px){.abcdef0{background-color:green;}}',
    ].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '': [
        {
          className: 'abcdef0',
          css: 'background-color:red;',
        },
      ],
      '@media screen and (max-width: 1024px)': {
        '': [
          {
            className: 'abcdef0',
            css: 'background-color:green;',
          },
        ],
      },
      '@media screen and (max-width: 992px)': {
        '': [
          {
            className: 'abcdef0',
            css: 'background-color:blue;',
          },
        ],
      },
    });
  });

  it('pass on overriddenBy information from atomic css to monolithic css', () => {
    const rules = [
      { cssRule: '.abcdef0{background-color:red;}', overriddenBy: 'bcdefg0' },
      { cssRule: '.abcdef0>div{color:green;}', overriddenBy: 'bcdefg1' },
      { cssRule: '@media screen and (max-width: 992px){.abcdef0{background-color:blue;}}', overriddenBy: 'bcdefg2' },
    ];
    expect(getMonolithicCSSRules(rules)).toEqual({
      '': [
        {
          className: 'abcdef0',
          css: 'background-color:red;',
          overriddenBy: 'bcdefg0',
        },
      ],
      '>div': [
        {
          className: 'abcdef0',
          css: 'color:green;',
          overriddenBy: 'bcdefg1',
        },
      ],
      '@media screen and (max-width: 992px)': {
        '': [
          {
            className: 'abcdef0',
            css: 'background-color:blue;',
            overriddenBy: 'bcdefg2',
          },
        ],
      },
    });
  });

  it('group atomic css when class name selector has selector in front', () => {
    const rules = [
      '[data-keyboard-nav] .abcdef0:focus{background-color:red;}',
      '[data-keyboard-nav] .abcdef1{color:red;}',
    ].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '[data-keyboard-nav] ': [
        {
          className: 'abcdef1',
          css: 'color:red;',
          overriddenBy: undefined,
        },
      ],
      '[data-keyboard-nav] :focus': [
        {
          className: 'abcdef0',
          css: 'background-color:red;',
          overriddenBy: undefined,
        },
      ],
    });
  });
});
