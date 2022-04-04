import { SEQUENCE_PREFIX } from '../constants';
import { makeStyles } from '../makeStyles';
import { mergeClasses } from '../mergeClasses';
import { createDOMRenderer } from '../renderer/createDOMRenderer';
import { MakeStylesOptions } from '../types';
import { injectDevTools } from './injectDevTools';

jest.mock('./isDevToolsEnabled.ts', () => ({
  isDevToolsEnabled: true,
}));

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

const findSequenceHash = (classNames: string) =>
  classNames.split(' ').find(className => className.startsWith(SEQUENCE_PREFIX));

describe('injectDevTools', () => {
  it.each<'ltr' | 'rtl'>(['rtl', 'ltr'])('getInfo returns styles merge tree when dir=%p', dir => {
    const windowMock = {};
    injectDevTools(windowMock as (Window & typeof globalThis) | null);

    const classes = makeStyles({
      block: { display: 'block' },
      grid: { display: 'grid' },
    })({ ...options, dir });

    const sequenceBlock = findSequenceHash(classes.block);
    const sequenceGrid = findSequenceHash(classes.grid);

    const className1 = mergeClasses('ui-button', classes.block);
    const className2 = mergeClasses(className1, classes.grid);

    const sequence1 = findSequenceHash(className1);
    const sequence2 = findSequenceHash(className2);

    const testElement = document.createElement('div');
    testElement.className = className2;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((windowMock as any).__GRIFFEL_DEVTOOLS__.getInfo(testElement)).toEqual({
      children: [
        {
          children: [
            {
              children: [],
              direction: dir,
              rules: [
                {
                  className: 'ftgm304',
                  cssRule: '.ftgm304{display:block;}',
                },
              ],
              sequenceHash: sequenceBlock,
              slot: 'block',
            },
          ],
          direction: dir,
          sequenceHash: sequence1,
        },
        {
          children: [],
          direction: dir,
          rules: [
            {
              className: 'f13qh94s',
              cssRule: '.f13qh94s{display:grid;}',
            },
          ],
          sequenceHash: sequenceGrid,
          slot: 'grid',
        },
      ],
      direction: dir,
      sequenceHash: sequence2,
    });
  });
});
