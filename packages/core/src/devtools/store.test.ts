import { SEQUENCE_PREFIX } from '../constants';
import { makeStyles } from '../makeStyles';
import { mergeClasses } from '../mergeClasses';
import { createDOMRenderer } from '../renderer/createDOMRenderer';
import { MakeStylesOptions } from '../types';
import { MK_DEBUG } from './store';

jest.mock('./isDevToolsEnabled', () => ({
  isDevToolsEnabled: true,
}));

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

const findSequenceHash = (classNames: string) =>
  classNames.split(' ').find(className => className.startsWith(SEQUENCE_PREFIX));

describe('MK_DEBUG', () => {
  it('getChildrenSequences returns children sequences for multi-level merge', () => {
    const classes = makeStyles({
      block: { display: 'block' },
      grid: { display: 'grid' },
    })(options);

    const sequenceBlock = findSequenceHash(classes.block);
    const sequenceGrid = findSequenceHash(classes.grid);
    expect(MK_DEBUG.getChildrenSequences(sequenceGrid!)).toEqual([]);

    const className1 = mergeClasses('ui-button', classes.block);
    const className2 = mergeClasses(className1, classes.grid);

    const sequence1 = findSequenceHash(className1);
    const sequence2 = findSequenceHash(className2);

    expect(MK_DEBUG.getChildrenSequences(sequence1!)).toEqual([sequenceBlock]);
    expect(MK_DEBUG.getChildrenSequences(sequence2!)).toEqual([sequence1, sequenceGrid]);
  });

  it('getCSSRules returns cssRules', () => {
    makeStyles({
      block: { display: 'block', marginLeft: '10px' },
    })(options);

    expect(MK_DEBUG.getCSSRules()).toEqual([
      '.ftgm304{display:block;}',
      '.f13qh94s{display:grid;}',
      '.f1oou7ox{margin-left:10px;}',
      '.f1pxv85q{margin-right:10px;}',
    ]);
  });

  it.each<'ltr' | 'rtl'>(['rtl', 'ltr'])('getSequenceDetails returns slotName when dir=%p', dir => {
    const classes = makeStyles({
      block: { display: 'block' },
      grid: { display: 'grid' },
    })({ ...options, dir });

    const sequenceBlock = findSequenceHash(classes.block);
    const sequenceGrid = findSequenceHash(classes.grid);

    expect(MK_DEBUG.getSequenceDetails(sequenceBlock!)).toEqual({ slotName: 'block' });
    expect(MK_DEBUG.getSequenceDetails(sequenceGrid!)).toEqual({ slotName: 'grid' });
  });
});
