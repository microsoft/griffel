import { griffelRendererSerializer } from './common/snapshotSerializers';
import { createDOMRenderer } from './renderer/createDOMRenderer';
import { makeResetStyles } from './makeResetStyles';
import type { GriffelRenderer } from './types';

expect.addSnapshotSerializer(griffelRendererSerializer);

describe('makeResetStyles', () => {
  let renderer: GriffelRenderer;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    renderer = createDOMRenderer(document);
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('returns a single classname for a single style', () => {
    const computeClassName = makeResetStyles({
      color: 'red',
      flexDirection: 'row',
    });

    expect(computeClassName({ dir: 'ltr', renderer })).toEqual('r7lmmpp');
    expect(renderer).toMatchInlineSnapshot(`
      /** bucket "r" {"data-priority":"0"} **/
      .r7lmmpp {
        color: red;
        flex-direction: row;
      }
    `);
  });

  it('handles RTL', () => {
    const computeClassName = makeResetStyles({
      padding: '40px 20px 10px 5px',
    });

    expect(computeClassName({ dir: 'ltr', renderer })).toEqual('rgb6zd6');
    expect(computeClassName({ dir: 'rtl', renderer })).toEqual('rjhindo');

    expect(renderer).toMatchInlineSnapshot(`
      /** bucket "r" {"data-priority":"0"} **/
      .rgb6zd6 {
        padding: 40px 20px 10px 5px;
      }
      .rjhindo {
        padding: 40px 5px 10px 20px;
      }
    `);
  });

  it('handles at rules', () => {
    const computeClassName = makeResetStyles({
      color: 'red',
      '@media (min-width: 100px)': { color: 'blue' },
    });

    expect(computeClassName({ dir: 'ltr', renderer })).toEqual('rbwcbv2');
    expect(renderer).toMatchInlineSnapshot(`
      /** bucket "r" {"data-priority":"0"} **/
      .rbwcbv2 {
        color: red;
      }
      /** bucket "s" {"data-priority":"0"} **/
      @media (min-width: 100px) {
        .rbwcbv2 {
          color: blue;
        }
      }
    `);
  });
});
