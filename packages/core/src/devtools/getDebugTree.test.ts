import { SEQUENCE_PREFIX } from '../constants';
import { makeStyles } from '../makeStyles';
import { mergeClasses } from '../mergeClasses';
import { createDOMRenderer } from '../renderer/createDOMRenderer';
import { MakeStylesOptions } from '../types';
import { getDebugTree } from './getDebugTree';

jest.mock('./isDevToolsEnabled', () => ({
  isDevToolsEnabled: true,
}));

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

const findSequenceHash = (classNames: string) =>
  classNames.split(' ').find(className => className.startsWith(SEQUENCE_PREFIX));

const souceURLregex = /.*\/.*:[0-9]+:[0-9]+/; // url with line and column number

describe('getDebugTree', () => {
  it.each<'ltr' | 'rtl'>(['ltr', 'rtl'])('returns styles merge tree when dir=%p', dir => {
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

    expect(getDebugTree(sequence2!)).toEqual({
      children: [
        {
          children: [
            {
              children: [],
              debugClassNames: [
                {
                  className: 'ftgm304',
                  overriddenBy: 'f13qh94s',
                },
              ],
              direction: dir,
              rules: {
                ftgm304: '.ftgm304{display:block;}',
              },
              sequenceHash: sequenceBlock,
              slot: 'block',
              sourceURL: expect.stringMatching(souceURLregex),
            },
          ],
          debugClassNames: [
            {
              className: 'ftgm304',
              overriddenBy: 'f13qh94s',
            },
          ],
          direction: dir,
          sequenceHash: sequence1,
        },
        {
          children: [],
          debugClassNames: [
            {
              className: 'f13qh94s',
              overriddenBy: undefined,
            },
          ],
          direction: dir,
          rules: {
            f13qh94s: '.f13qh94s{display:grid;}',
          },
          sequenceHash: sequenceGrid,
          slot: 'grid',
          sourceURL: expect.stringMatching(souceURLregex),
        },
      ],
      debugClassNames: [
        {
          className: 'f13qh94s',
          overriddenBy: undefined,
        },
      ],
      direction: dir,
      sequenceHash: sequence2,
    });
  });
});
