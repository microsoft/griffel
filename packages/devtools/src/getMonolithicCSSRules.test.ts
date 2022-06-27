import { getMonolithicCSSRules } from './getMonolithicCSSRules';

describe('getMonolithicCSSRules', () => {
  it('group atomic css with class names selector', () => {
    const rules = ['.fabcde0{background-color:red;}', '.fabcde1{color:red;}'].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '': [
        {
          className: 'fabcde0',
          css: 'background-color:red;',
        },
        {
          className: 'fabcde1',
          css: 'color:red;',
        },
      ],
    });
  });

  it('group atomic css with child class names selector', () => {
    const rules = ['.f1dx00p .class1{padding-right: 10px;}'].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      ' .class1': [
        {
          className: 'f1dx00p',
          css: 'padding-right:10px;',
        },
      ],
    });
  });

  it('separate atomic css with class names selector and pseudo selector', () => {
    const rules = [
      '.fabcde0{background-color:red;}',
      '.fabcde1{display:block;}',
      '.fabcde2:hover{display:none;}',
      '.fabcde3:hover{color:red;}',
    ].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '': [
        {
          className: 'fabcde0',
          css: 'background-color:red;',
        },
        {
          className: 'fabcde1',
          css: 'display:block;',
        },
      ],
      ':hover': [
        {
          className: 'fabcde2',
          css: 'display:none;',
        },
        {
          className: 'fabcde3',
          css: 'color:red;',
        },
      ],
    });
  });

  it('group atomic css with media selector', () => {
    const rules = [
      '.fabcde0{background-color:red;}',
      '.fabcde1{display:block;}',
      '.fabcde2:hover{display:none;}',
      '.fabcde3:hover{color:red;}',
    ].map(cssRule => ({ cssRule: `@media screen and (max-width: 992px){${cssRule}}` }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '@media screen and (max-width: 992px)': {
        '': [
          {
            className: 'fabcde0',
            css: 'background-color:red;',
          },
          {
            className: 'fabcde1',
            css: 'display:block;',
          },
        ],
        ':hover': [
          {
            className: 'fabcde2',
            css: 'display:none;',
          },
          {
            className: 'fabcde3',
            css: 'color:red;',
          },
        ],
      },
    });
  });

  it('separate atomic css with different media selector', () => {
    const rules = [
      '.fabcde0{background-color:red;}',
      '@media screen and (max-width: 992px){.fabcde0{background-color:blue;}}',
      '@media screen and (max-width: 1024px){.fabcde0{background-color:green;}}',
    ].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '': [
        {
          className: 'fabcde0',
          css: 'background-color:red;',
        },
      ],
      '@media screen and (max-width: 1024px)': {
        '': [
          {
            className: 'fabcde0',
            css: 'background-color:green;',
          },
        ],
      },
      '@media screen and (max-width: 992px)': {
        '': [
          {
            className: 'fabcde0',
            css: 'background-color:blue;',
          },
        ],
      },
    });
  });

  it('pass on overriddenBy information from atomic css to monolithic css', () => {
    const rules = [
      { cssRule: '.fabcde0{background-color:red;}', overriddenBy: 'bcdefg0' },
      { cssRule: '.fabcde0>div{color:green;}', overriddenBy: 'bcdefg1' },
      { cssRule: '@media screen and (max-width: 992px){.fabcde0{background-color:blue;}}', overriddenBy: 'bcdefg2' },
    ];
    expect(getMonolithicCSSRules(rules)).toEqual({
      '': [
        {
          className: 'fabcde0',
          css: 'background-color:red;',
          overriddenBy: 'bcdefg0',
        },
      ],
      '>div': [
        {
          className: 'fabcde0',
          css: 'color:green;',
          overriddenBy: 'bcdefg1',
        },
      ],
      '@media screen and (max-width: 992px)': {
        '': [
          {
            className: 'fabcde0',
            css: 'background-color:blue;',
            overriddenBy: 'bcdefg2',
          },
        ],
      },
    });
  });

  it('group atomic css when class name selector has selector in front', () => {
    const rules = [
      '[data-keyboard-nav] .fabcde0:focus{background-color:red;}',
      '[data-keyboard-nav] .fabcde1{color:red;}',
      '[data-keyboard-nav] .fabcde1 .class1{padding-top:10px;}',
    ].map(cssRule => ({ cssRule }));
    expect(getMonolithicCSSRules(rules)).toEqual({
      '[data-keyboard-nav] ': [
        {
          className: 'fabcde1',
          css: 'color:red;',
          overriddenBy: undefined,
        },
      ],
      '[data-keyboard-nav]  .class1': [
        {
          className: 'fabcde1',
          css: 'padding-top:10px;',
          overriddenBy: undefined,
        },
      ],
      '[data-keyboard-nav] :focus': [
        {
          className: 'fabcde0',
          css: 'background-color:red;',
          overriddenBy: undefined,
        },
      ],
    });
  });
});
