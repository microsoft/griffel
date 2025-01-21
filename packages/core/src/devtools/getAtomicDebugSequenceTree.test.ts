import { SEQUENCE_PREFIX } from '../constants';
import { makeStyles } from '../makeStyles';
import type { MakeStylesOptions } from '../makeStyles';
import { mergeClasses } from '../mergeClasses';
import { createDOMRenderer } from '../renderer/createDOMRenderer';
import { getAtomicDebugSequenceTree } from './getAtomicDebugSequenceTree';

jest.mock('./isDevToolsEnabled', () => ({
  isDevToolsEnabled: true,
}));

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

const findSequenceHash = (classNames: string) =>
  classNames.split(' ').find(className => className.startsWith(SEQUENCE_PREFIX));

const sourceURLregex = /.*[/\\].*:[0-9]+:[0-9]+/; // url with line and column number

describe('getAtomicDebugSequenceTree', () => {
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

    expect(getAtomicDebugSequenceTree(sequence2!)).toEqual({
      children: [
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
          sourceURL: expect.stringMatching(sourceURLregex),
        },
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
              sourceURL: expect.stringMatching(sourceURLregex),
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

  it('returns correct merging tree when style and overriding style are the same', () => {
    const classes = makeStyles({
      redBlock: { display: 'block', color: 'red' },
      blueBlock: { display: 'block', color: 'blue' },
    })(options);

    const sequenceRedBlock = findSequenceHash(classes.redBlock);
    const sequenceBlueBlock = findSequenceHash(classes.blueBlock);

    const className1 = mergeClasses('ui-button', classes.redBlock);
    const className2 = mergeClasses(className1, classes.blueBlock);

    const sequence1 = findSequenceHash(className1);
    const sequence2 = findSequenceHash(className2);

    expect(getAtomicDebugSequenceTree(sequence2!)).toEqual({
      children: [
        {
          children: [],
          debugClassNames: [
            {
              className: 'ftgm304',
              overriddenBy: undefined,
            },
            {
              className: 'f163i14w',
              overriddenBy: undefined,
            },
          ],
          direction: 'ltr',
          rules: {
            f163i14w: '.f163i14w{color:blue;}',
            ftgm304: '.ftgm304{display:block;}',
          },
          sequenceHash: sequenceBlueBlock,
          slot: 'blueBlock',
          sourceURL: expect.stringMatching(sourceURLregex),
        },
        {
          children: [
            {
              children: [],
              debugClassNames: [
                {
                  className: 'ftgm304',
                  overriddenBy: 'ftgm304',
                },
                {
                  className: 'fe3e8s9',
                  overriddenBy: 'f163i14w',
                },
              ],
              direction: 'ltr',
              rules: {
                fe3e8s9: '.fe3e8s9{color:red;}',
                ftgm304: '.ftgm304{display:block;}',
              },
              sequenceHash: sequenceRedBlock,
              slot: 'redBlock',
              sourceURL: expect.stringMatching(sourceURLregex),
            },
          ],
          debugClassNames: [
            {
              className: 'ftgm304',
              overriddenBy: 'ftgm304',
            },
            {
              className: 'fe3e8s9',
              overriddenBy: 'f163i14w',
            },
          ],
          direction: 'ltr',
          sequenceHash: sequence1,
        },
      ],
      debugClassNames: [
        {
          className: 'ftgm304',
          overriddenBy: undefined,
        },
        {
          className: 'f163i14w',
          overriddenBy: undefined,
        },
      ],
      direction: 'ltr',
      sequenceHash: sequence2,
    });
  });
});
