import { griffelRulesSerializer } from '../common/snapshotSerializers';
import { resolveStyleRules } from './resolveStyleRules';
import { CSSClassesMap, CSSClasses, CSSRulesByBucket } from '../types';
import { UNSUPPORTED_CSS_PROPERTIES } from '..';

expect.addSnapshotSerializer(griffelRulesSerializer);

function getFirstClassName([resolvedClassesForSlot]: [CSSClassesMap, CSSRulesByBucket]): string {
  const className: CSSClasses = resolvedClassesForSlot[Object.keys(resolvedClassesForSlot)[0]];

  return Array.isArray(className) ? className[0] : className;
}

describe('resolveStyleRules', () => {
  describe('unsupported css properties', () => {
    let consoleSpy: jest.SpyInstance;
    beforeAll(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it.each(Object.keys(UNSUPPORTED_CSS_PROPERTIES))(
      'strips unsupported `%s` css property when not in production',
      property => {
        // Doesn't matter what the value is, just that the resulting objects are empty
        const res = resolveStyleRules({ [property]: 'dummy' as unknown as undefined });
        expect(res).toHaveLength(2);
        expect(res[0]).toEqual({});
        expect(res[1]).toEqual({});
      },
    );
  });

  describe('classnames', () => {
    it('generates unique classnames for pseudo selectors', () => {
      const classnamesSet = new Set<string>();

      classnamesSet.add(getFirstClassName(resolveStyleRules({ color: 'red' })));
      classnamesSet.add(getFirstClassName(resolveStyleRules({ ':hover': { color: 'red' } })));

      classnamesSet.add(
        getFirstClassName(resolveStyleRules({ '@media screen and (max-width: 992px)': { color: 'red' } })),
      );
      classnamesSet.add(
        getFirstClassName(
          resolveStyleRules({
            '@media screen and (max-width: 992px)': {
              ':hover': { color: 'red' },
            },
          }),
        ),
      );

      classnamesSet.add(
        getFirstClassName(
          resolveStyleRules({
            '@supports (display: grid)': { color: 'red' },
          }),
        ),
      );
      classnamesSet.add(
        getFirstClassName(
          resolveStyleRules({
            '@supports (display: grid)': {
              ':hover': { color: 'red' },
            },
          }),
        ),
      );

      classnamesSet.add(
        getFirstClassName(
          resolveStyleRules({
            '@supports (display: grid)': {
              '@media screen and (max-width: 992px)': {
                ':hover': { color: 'red' },
              },
            },
          }),
        ),
      );

      expect(classnamesSet.size).toBe(7);
    });

    it('skips invalid rules', () => {
      const [, cssRules] = resolveStyleRules({ color: '' });

      expect(cssRules).toEqual({ d: [] });
    });
  });

  describe('css', () => {
    it('resolves a single rule', () => {
      expect(resolveStyleRules({ color: 'red' })).toMatchInlineSnapshot(`
        .fe3e8s9 {
          color: red;
        }
      `);
    });

    it('resolves multiple rules', () => {
      expect(resolveStyleRules({ backgroundColor: 'green', color: 'red' })).toMatchInlineSnapshot(`
        .fcnqdeg {
          background-color: green;
        }
        .fe3e8s9 {
          color: red;
        }
      `);
    });

    it('trims values to generate the same classes', () => {
      expect(resolveStyleRules({ color: 'red ' /* ends with a space */ })).toMatchInlineSnapshot(`
        .fe3e8s9 {
          color: red;
        }
      `);
    });

    it('hyphenates camelcased CSS properties', () => {
      expect(
        resolveStyleRules({
          '--foo': 'var(--bar)',
          '--fooBar': 'var(--barBaz)',

          backgroundColor: 'red',
          MozBorderLeftColors: 'red',
        }),
      ).toMatchInlineSnapshot(`
        .f1qux40 {
          --foo: var(--bar);
        }
        .f14u957 {
          --fooBar: var(--barBaz);
        }
        .f3xbvq9 {
          background-color: red;
        }
        .f1qq0qht {
          -moz-border-left-colors: red;
        }
      `);
    });

    it('performs vendor prefixing', () => {
      expect(resolveStyleRules({ display: 'flex' })).toMatchInlineSnapshot(`
        .f22iagw {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
        }
      `);
    });

    it('handles falsy values', () => {
      expect(
        resolveStyleRules({
          zIndex: 1,
          position: null as unknown as undefined,
          top: undefined,
        }),
      ).toMatchInlineSnapshot(`
        .f19g0ac {
          z-index: 1;
        }
      `);
    });

    it('handles fallback values', () => {
      const actual = resolveStyleRules({ color: ['red', 'blue'] });
      expect(actual).toMatchInlineSnapshot(`
        .f15e90lz {
          color: red;
          color: blue;
        }
      `);
    });

    it('handles empty array of fallback values', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const warn = jest.spyOn(console, 'warn').mockImplementationOnce(() => {});

      const actual = resolveStyleRules({ color: [] });
      expect(actual).toMatchInlineSnapshot(``); /* empty result */

      expect(warn).toHaveBeenCalledWith(
        expect.stringMatching(
          /makeStyles\(\): An empty array was passed as input to "color", the property will be omitted in the styles./,
        ),
      );
    });

    describe('handles RTL', () => {
      it('property flipping', () => {
        expect(resolveStyleRules({ left: '5px' })).toMatchInlineSnapshot(`
          .f5b3q4t {
            left: 5px;
          }
          .flgfsvn {
            right: 5px;
          }
        `);
      });

      it('boxShadow with strings', () => {
        expect(
          resolveStyleRules({
            boxShadow: 'inset 2rem 0rem 0.4rem -1rem #eee',
          }),
        ).toMatchInlineSnapshot(`
                  .fissx19 {
                    box-shadow: inset 2rem 0rem 0.4rem -1rem #eee;
                  }
                  .f14ydmub {
                    box-shadow: inset -2rem 0rem 0.4rem -1rem #eee;
                  }
              `);
      });

      it('boxShadow with CSS variable', () => {
        expect(
          resolveStyleRules({
            boxShadow: 'inset 2rem 0rem 0.4rem -1rem var(--colorToken)',
          }),
        ).toMatchInlineSnapshot(`
                  .fko8do5 {
                    box-shadow: inset 2rem 0rem 0.4rem -1rem var(--colorToken);
                  }
                  .fvdav93 {
                    box-shadow: inset -2rem 0rem 0.4rem -1rem var(--colorToken);
                  }
              `);
      });

      it('boxShadow with multiple values', () => {
        expect(
          resolveStyleRules({
            boxShadow: 'inset 2rem 0rem 0.4rem -1rem var(--colorToken), 4px 0rem 0.4rem 2rem var(--anotherToken)',
          }),
        ).toMatchInlineSnapshot(`
          .frvj0nn {
            box-shadow: inset 2rem 0rem 0.4rem -1rem var(--colorToken),
              4px 0rem 0.4rem 2rem var(--anotherToken);
          }
          .fzr4yxb {
            box-shadow: inset -2rem 0rem 0.4rem -1rem var(--colorToken),
              -4px 0rem 0.4rem 2rem var(--anotherToken);
          }
        `);
      });
    });

    it('handles RTL @noflip', () => {
      expect(resolveStyleRules({ left: '5px /* @noflip */' })).toMatchInlineSnapshot(`
        .fm76jd0 {
          left: 5px;
        }
      `);
    });

    it('handles media queries with flipping values', () => {
      expect(
        resolveStyleRules({
          '@media screen and (max-width: 992px)': {
            textAlign: 'left',
          },
        }),
      ).toMatchInlineSnapshot(`
        @media screen and (max-width: 992px) {
          .f1f6067w {
            text-align: left;
          }
          .f133ge8t {
            text-align: right;
          }
        }
      `);
    });

    it('RTL @noflip will generate a different className', () => {
      const classnamesSet = new Set<string>();

      // Definitions with @noflip cannot be reused to usual ones as expected RTL styles will be different

      classnamesSet.add(getFirstClassName(resolveStyleRules({ left: '5px' })));
      classnamesSet.add(getFirstClassName(resolveStyleRules({ left: '5px /* @noflip */' })));

      expect(classnamesSet.size).toBe(2);
    });

    it('handles fallback values in RTL', () => {
      expect(
        resolveStyleRules({
          left: ['5px', '10px'],
          float: ['initial', 'left'],
        }),
      ).toMatchInlineSnapshot(`
        .f14hk0f5 {
          left: 5px;
          left: 10px;
        }
        .f18hwu1w {
          right: 5px;
          right: 10px;
        }
        .f8ngpof {
          float: initial;
          float: left;
        }
        .fhsnlhg {
          float: initial;
          float: right;
        }
      `);
    });

    it('errors if fallback values result in multiple properties in RTL, skips the property', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const error = jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      expect(
        resolveStyleRules({
          left: ['5px /* @noflip */', '10px'],
          color: 'red',
        }),
      ).toMatchInlineSnapshot(`
        .fe3e8s9 {
          color: red;
        }
      `); /* only color */

      expect(error).toHaveBeenCalledWith(
        expect.stringMatching(
          /mixing CSS fallback values which result in multiple CSS properties in RTL is not supported/,
        ),
      );
    });

    it('handles nested selectors', () => {
      expect(resolveStyleRules({ ':hover': { color: 'red' } })).toMatchInlineSnapshot(`
        .faf35ka:hover {
          color: red;
        }
      `);
      expect(resolveStyleRules({ '::after': { content: '""' } })).toMatchInlineSnapshot(`
        .f13zj6fq::after {
          content: "";
        }
      `);

      expect(resolveStyleRules({ '[data-fluent="true"]': { color: 'green' } })).toMatchInlineSnapshot(`
        .fcopvey[data-fluent="true"] {
          color: green;
        }
      `);
      expect(resolveStyleRules({ '& [data-fluent="true"]': { color: 'green' } })).toMatchInlineSnapshot(`
        .f1k5aqsk [data-fluent="true"] {
          color: green;
        }
      `);

      expect(resolveStyleRules({ '> div': { color: 'green' } })).toMatchInlineSnapshot(`
        .f18wx08q > div {
          color: green;
        }
      `);

      expect(resolveStyleRules({ '& .foo': { color: 'green' } })).toMatchInlineSnapshot(`
        .f15f830o .foo {
          color: green;
        }
      `);
      expect(resolveStyleRules({ '&.foo': { color: 'green' } })).toMatchInlineSnapshot(`
        .fe1zdmy.foo {
          color: green;
        }
      `);

      expect(resolveStyleRules({ '& #foo': { color: 'green' } })).toMatchInlineSnapshot(`
        .fie1itf #foo {
          color: green;
        }
      `);
      expect(resolveStyleRules({ '&#foo': { color: 'green' } })).toMatchInlineSnapshot(`
        .fwxog6r#foo {
          color: green;
        }
      `);
    });

    it('handles complex nested selectors', () => {
      expect(resolveStyleRules({ '& > :first-child': { '& svg': { color: 'red' } } })).toMatchInlineSnapshot(`
        .fxfx2ih > :first-child svg {
          color: red;
        }
      `);
    });

    it('handles comma-separated selectors', () => {
      expect(
        resolveStyleRules({
          ':active,:focus-within': {
            paddingLeft: '10px',
          },
        }),
      ).toMatchInlineSnapshot(`
        .f14f5aie:active,
        .f14f5aie:focus-within {
          padding-left: 10px;
        }
        .f1sheuf0:active,
        .f1sheuf0:focus-within {
          padding-right: 10px;
        }
      `);

      expect(
        resolveStyleRules({
          ':hover,:focus-within': {
            '::before': {
              color: 'orange',
            },
          },
        }),
      ).toMatchInlineSnapshot(`
        .fij4gri:hover::before,
        .fij4gri:focus-within::before {
          color: orange;
        }
      `);
    });

    it('handles named container queries', () => {
      const result = resolveStyleRules({ '@container foo (max-width: 1px)': { color: 'red' } });
      expect(result).toMatchInlineSnapshot(`
        @container foo (max-width: 1px) {
          .fe3e8s9 {
            color: red;
          }
        }
      `);

      expect(Object.keys(result[1])).toEqual(['c']);
    });

    it('handles unnamed container queries', () => {
      const result = resolveStyleRules({ '@container (max-width: 1px)': { color: 'red' } });
      expect(result).toMatchInlineSnapshot(`
        @container (max-width: 1px) {
          .fe3e8s9 {
            color: red;
          }
        }
      `);

      expect(Object.keys(result[1])).toEqual(['c']);
    });

    it('handles media queries', () => {
      expect(
        resolveStyleRules({
          color: 'green',
          '@media screen and (max-width: 992px)': { color: 'red' },
        }),
      ).toMatchInlineSnapshot(`
        .fka9v86 {
          color: green;
        }
        @media screen and (max-width: 992px) {
          .f1ojdyje {
            color: red;
          }
        }
      `);
    });

    it('handles media queries with pseudo selectors', () => {
      expect(
        resolveStyleRules({
          color: 'green',
          '@media screen and (max-width: 992px)': {
            ':hover': {
              color: 'red ',
            },
          },
        }),
      ).toMatchInlineSnapshot(`
        .fka9v86 {
          color: green;
        }
        @media screen and (max-width: 992px) {
          .f7wpa5l:hover {
            color: red;
          }
        }
      `);
    });

    it('handles nested media queries', () => {
      expect(
        resolveStyleRules({
          color: 'red',
          '@media screen and (max-width: 992px)': {
            color: 'red',
            '@media (min-width: 100px)': { color: 'red' },
          },
        }),
      ).toMatchInlineSnapshot(`
        .fe3e8s9 {
          color: red;
        }
        @media screen and (max-width: 992px) {
          .f1ojdyje {
            color: red;
          }
        }
        @media screen and (max-width: 992px) and (min-width: 100px) {
          .f19a6424 {
            color: red;
          }
        }
      `);
    });

    it('handles layer queries', () => {
      expect(
        resolveStyleRules({
          color: 'green',
          '@layer color': { color: 'red' },
        }),
      ).toMatchInlineSnapshot(`
        .fka9v86 {
          color: green;
        }
        @layer color {
          .f1hjcal7 {
            color: red;
          }
        }
      `);
    });

    it('handles layer queries with dots', () => {
      expect(
        resolveStyleRules({
          '@layer framework.utilities': { color: 'red' },
        }),
      ).toMatchInlineSnapshot(`
        @layer framework.utilities {
          .faxdetk {
            color: red;
          }
        }
      `);
    });
    it('handles layer queries with pseudo selectors', () => {
      expect(
        resolveStyleRules({
          color: 'green',
          '@layer color': {
            ':hover': {
              color: 'red ',
            },
          },
        }),
      ).toMatchInlineSnapshot(`
        .fka9v86 {
          color: green;
        }
        @layer color {
          .f1jv0g3z:hover {
            color: red;
          }
        }
      `);
    });

    it('handles nested layer queries', () => {
      expect(
        resolveStyleRules({
          color: 'red',
          '@layer color': {
            color: 'red',
            '@layer theme': { color: 'red' },
          },
        }),
      ).toMatchInlineSnapshot(`
        .fe3e8s9 {
          color: red;
        }
        @layer color {
          .f1hjcal7 {
            color: red;
          }
        }
        @layer color.theme {
          .f132c7g3 {
            color: red;
          }
        }
      `);
    });

    it('handles supports queries', () => {
      expect(
        resolveStyleRules({
          '@supports (display:block)': { color: 'green' },
        }),
      ).toMatchInlineSnapshot(`
        @supports (display: block) {
          .f1yofsfp {
            color: green;
          }
        }
      `);
    });

    it('handles :global selector', () => {
      expect(
        resolveStyleRules({
          ':global(body)': {
            ':focus': {
              color: 'green',
              ':hover': { color: 'blue' },
              '& .foo': { color: 'yellow' },
            },
          },
        }),
      ).toMatchInlineSnapshot(`
        body .f192vvyd:focus {
          color: green;
        }
        body .f1tz2pjr:focus:hover {
          color: blue;
        }
        body .f1dl7obt:focus .foo {
          color: yellow;
        }
      `);
      expect(
        resolveStyleRules({
          ':global(body):focus': { color: 'pink' },
          ':global(body) :focus': { color: 'green' },
          ':global(body) :focus:hover': { color: 'blue' },
          ':global(body) :focus .foo': { color: 'yellow' },
        }),
      ).toMatchInlineSnapshot(`
        body .fug6i29:focus {
          color: pink;
        }
        body .frou13r :focus {
          color: green;
        }
        body .f1emv7y1 :focus:hover {
          color: blue;
        }
        body .f1g015sp :focus .foo {
          color: yellow;
        }
      `);
    });

    it('supports :global as a nested selector', () => {
      expect(
        resolveStyleRules({
          ':focus': { ':global(body)': { color: 'green' } },
        }),
      ).toMatchInlineSnapshot(`
        body .fz7er5p:focus {
          color: green;
        }
      `);
    });
  });

  describe('keyframes', () => {
    it('allows to define string as animationName', () => {
      expect(
        resolveStyleRules({
          animationName: 'fade-in slide-out',
          animationIterationCount: 'infinite',
          animationDuration: '5s',
        }),
      ).toMatchInlineSnapshot(`
        .fc59ano {
          -webkit-animation-name: fade-in slide-out;
          animation-name: fade-in slide-out;
        }
        .f1cpbl36 {
          -webkit-animation-iteration-count: infinite;
          animation-iteration-count: infinite;
        }
        .f1t9cprh {
          -webkit-animation-duration: 5s;
          animation-duration: 5s;
        }
      `);
    });

    it('allows to define object as animationName', () => {
      expect(
        resolveStyleRules({
          animationName: {
            from: {
              transform: 'rotate(0deg)',
            },
            to: {
              transform: 'rotate(360deg)',
            },
          },
          animationIterationCount: 'infinite',
          animationDuration: '5s',
        }),
      ).toMatchInlineSnapshot(`
        @-webkit-keyframes f1q8eu9e {
          from {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          to {
            -webkit-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
        @-webkit-keyframes f55c0se {
          from {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          to {
            -webkit-transform: rotate(-360deg);
            -moz-transform: rotate(-360deg);
            -ms-transform: rotate(-360deg);
            transform: rotate(-360deg);
          }
        }
        @keyframes f1q8eu9e {
          from {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          to {
            -webkit-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
        @keyframes f55c0se {
          from {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          to {
            -webkit-transform: rotate(-360deg);
            -moz-transform: rotate(-360deg);
            -ms-transform: rotate(-360deg);
            transform: rotate(-360deg);
          }
        }
        .f1g6ul6r {
          -webkit-animation-name: f1q8eu9e;
          animation-name: f1q8eu9e;
        }
        .f1fp4ujf {
          -webkit-animation-name: f55c0se;
          animation-name: f55c0se;
        }
        .f1cpbl36 {
          -webkit-animation-iteration-count: infinite;
          animation-iteration-count: infinite;
        }
        .f1t9cprh {
          -webkit-animation-duration: 5s;
          animation-duration: 5s;
        }
      `);
    });

    it('allows to define array as animationName', () => {
      expect(
        resolveStyleRules({
          animationName: [
            {
              from: {
                transform: 'rotate(0deg)',
              },
              to: {
                transform: 'rotate(360deg)',
              },
            },
            {
              from: {
                opacity: '0',
              },
              to: {
                opacity: '1',
              },
            },
          ],
          animationIterationCount: 'infinite',
          animationDuration: '5s',
        }),
      ).toMatchInlineSnapshot(`
        @-webkit-keyframes f1q8eu9e {
          from {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          to {
            -webkit-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
        @-webkit-keyframes f55c0se {
          from {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          to {
            -webkit-transform: rotate(-360deg);
            -moz-transform: rotate(-360deg);
            -ms-transform: rotate(-360deg);
            transform: rotate(-360deg);
          }
        }
        @keyframes f1q8eu9e {
          from {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          to {
            -webkit-transform: rotate(360deg);
            -moz-transform: rotate(360deg);
            -ms-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
        @keyframes f55c0se {
          from {
            -webkit-transform: rotate(0deg);
            -moz-transform: rotate(0deg);
            -ms-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          to {
            -webkit-transform: rotate(-360deg);
            -moz-transform: rotate(-360deg);
            -ms-transform: rotate(-360deg);
            transform: rotate(-360deg);
          }
        }
        @-webkit-keyframes f5j8bii {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes f5j8bii {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .fng7zue {
          -webkit-animation-name: f1q8eu9e, f5j8bii;
          animation-name: f1q8eu9e, f5j8bii;
        }
        .f12eevt1 {
          -webkit-animation-name: f55c0se, f5j8bii;
          animation-name: f55c0se, f5j8bii;
        }
        .f1cpbl36 {
          -webkit-animation-iteration-count: infinite;
          animation-iteration-count: infinite;
        }
        .f1t9cprh {
          -webkit-animation-duration: 5s;
          animation-duration: 5s;
        }
      `);
    });
  });

  describe('output', () => {
    it('contains less members for properties that do not depend on text direction', () => {
      expect(resolveStyleRules({ color: 'red', paddingLeft: '10px' })[0]).toEqual({
        sj55zd: 'fe3e8s9',
        uwmqm3: ['frdkuqy', 'f81rol6'],
      });
    });

    it('handles "&" in pseudo selectors equally', () => {
      const caseA = resolveStyleRules({ ':hover': { color: 'red' } });
      const caseB = resolveStyleRules({ '&:hover': { color: 'red' } });

      expect(caseA[0]).toEqual(caseB[0]);
      expect(caseA[1]).toEqual(caseB[1]);
    });
  });
});
