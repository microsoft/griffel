import { griffelRendererSerializer } from './common/snapshotSerializers';
import { createDOMRenderer } from './renderer/createDOMRenderer';
import { makeResetStyles } from './makeResetStyles';
import { GriffelRenderer } from './types';

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

    expect(computeClassName({ dir: 'ltr', renderer })).toEqual('rf7lmmpp');
    expect(renderer).toMatchInlineSnapshot(`
      .rf7lmmpp {
        color: red;
        -webkit-flex-direction: row;
        -ms-flex-direction: row;
        flex-direction: row;
      }
    `);
  });
});
