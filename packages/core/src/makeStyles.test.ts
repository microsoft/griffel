import { createDOMRenderer } from './renderer/createDOMRenderer';
import { griffelRendererSerializer } from './common/snapshotSerializers';
import { makeStyles } from './makeStyles';
import { GriffelRenderer } from './types';

expect.addSnapshotSerializer(griffelRendererSerializer);

describe('makeStyles', () => {
  let renderer: GriffelRenderer;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    renderer = createDOMRenderer(document);
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('returns an empty classname for an empty style set', () => {
    const computeClasses = makeStyles({
      root: {},
    });
    expect(computeClasses({ dir: 'ltr', renderer }).root).toEqual('');
  });

  it('returns a single classname for a single style', () => {
    const computeClasses = makeStyles({
      root: {
        color: 'red',
      },
    });
    expect(computeClasses({ dir: 'ltr', renderer }).root).toEqual('___afhpfp0 fe3e8s9');

    expect(renderer).toMatchInlineSnapshot(`
      .fe3e8s9 {
        color: red;
      }
    `);
  });

  it('returns multiple classnames for complex rules', () => {
    const computeClasses = makeStyles({
      root: {
        color: 'red',
        position: 'absolute',
      },
    });
    expect(computeClasses({ dir: 'ltr', renderer }).root).toEqual('___1jgns8t fe3e8s9 f1euv43f');

    expect(renderer).toMatchInlineSnapshot(`
      .fe3e8s9 {
        color: red;
      }
      .f1euv43f {
        position: absolute;
      }
    `);
  });

  it('handles RTL for styles', () => {
    const computeClasses = makeStyles({
      root: {
        paddingLeft: '10px',
        borderLeftWidth: '10px',
      },
    });

    const ltrClasses = computeClasses({ dir: 'ltr', renderer }).root;
    const rtlClasses = computeClasses({ dir: 'rtl', renderer }).root;

    expect(ltrClasses).toEqual('___a0zqzs0 frdkuqy f1c8chgj');
    expect(rtlClasses).toEqual('___7x57i00 f81rol6 f19krssl');

    expect(renderer).toMatchInlineSnapshot(`
      .frdkuqy {
        padding-left: 10px;
      }
      .f81rol6 {
        padding-right: 10px;
      }
      .f1c8chgj {
        border-left-width: 10px;
      }
      .f19krssl {
        border-right-width: 10px;
      }
    `);
  });

  it('handles RTL for keyframes', () => {
    const computeClasses = makeStyles({
      root: {
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
      },
    });
    expect(computeClasses({ dir: 'rtl', renderer }).root).toBe('___3kh5ri0 f1fp4ujf f1cpbl36 f1t9cprh');

    expect(renderer).toMatchInlineSnapshot(`
      @keyframes f1q8eu9e {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes f55c0se {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(-360deg);
        }
      }
      .f1g6ul6r {
        animation-name: f1q8eu9e;
      }
      .f1fp4ujf {
        animation-name: f55c0se;
      }
      .f1cpbl36 {
        animation-iteration-count: infinite;
      }
      .f1t9cprh {
        animation-duration: 5s;
      }
    `);
  });

  it('handles multiple renderers', () => {
    const rendererA = createDOMRenderer();
    const rendererB = createDOMRenderer();

    const computeClasses = makeStyles({
      root: { display: 'flex', paddingLeft: '10px' },
    });

    const classesA = computeClasses({ dir: 'rtl', renderer: rendererA }).root;
    const classesB = computeClasses({ dir: 'rtl', renderer: rendererB }).root;

    // Classes emitted by different renderers can be the same
    expect(classesA).toBe(classesB);
    // Style elements should be different for different renderers
    expect(rendererA.stylesheets.d).not.toBe(rendererB.stylesheets.d);

    expect(rendererA).toMatchInlineSnapshot(`
      .f22iagw {
        display: flex;
      }
      .frdkuqy {
        padding-left: 10px;
      }
      .f81rol6 {
        padding-right: 10px;
      }
    `);
    expect(rendererB).toMatchInlineSnapshot(`
      .f22iagw {
        display: flex;
      }
      .frdkuqy {
        padding-left: 10px;
      }
      .f81rol6 {
        padding-right: 10px;
      }
    `);
  });

  it('handles numeric slot names', () => {
    const computeClasses = makeStyles({
      42: {
        color: 'red',
      },
    });
    expect(computeClasses({ dir: 'ltr', renderer })[42]).toEqual('___afhpfp0 fe3e8s9');

    expect(renderer).toMatchInlineSnapshot(`
      .fe3e8s9 {
        color: red;
      }
    `);
  });

  it.each<'test' | 'development'>(['test', 'development'])(
    'in non-production mode, hashes include debug information',
    env => {
      process.env.NODE_ENV = env;
      const computeClasses = makeStyles({
        root: { color: 'red' },
      });

      expect(computeClasses({ dir: 'ltr', renderer }).root).toEqual('___afhpfp0_0000000 fe3e8s9');
    },
  );
});
