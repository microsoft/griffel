import { DEFINITION_LOOKUP_TABLE, RESET_HASH_PREFIX, SEQUENCE_PREFIX } from '../constants';
import { makeResetStyles } from '../makeResetStyles';
import { makeStyles } from '../makeStyles';
import type { MakeStylesOptions } from '../makeStyles';
import { createDOMRenderer } from '../renderer/createDOMRenderer';
import { mergeDebugSequence } from './mergeDebugSequence';
import { getDebugClassNames } from './utils';

jest.mock('./isDevToolsEnabled', () => ({
  isDevToolsEnabled: true,
}));

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

const findSequenceHash = (classNames: string) =>
  classNames.split(' ').find(className => className.startsWith(SEQUENCE_PREFIX));

const findResetHash = (classNames: string) =>
  classNames.split(' ').find(className => className.startsWith(RESET_HASH_PREFIX));

describe('mergeDebugSequence', () => {
  it('returns undefined when both inputs are undefined', () => {
    expect(mergeDebugSequence(undefined, undefined)).toBeUndefined();
  });

  it('returns atomic debug tree when reset classes is undefined', () => {
    const classes = makeStyles({
      block: { display: 'block' },
    })(options);

    const atomicSequence = findSequenceHash(classes.block);
    const result = mergeDebugSequence(atomicSequence, undefined);

    expect(result?.sequenceHash).toBe(atomicSequence);
    expect(result?.children).toHaveLength(0);
  });

  it('returns reset debug tree when atomic classes is undefined', () => {
    const classes = makeResetStyles({ margin: 0 })(options);

    const resetSequence = findResetHash(classes);
    const result = mergeDebugSequence(undefined, resetSequence);

    expect(result?.sequenceHash).toBe(resetSequence);
    expect(result?.children).toHaveLength(0);
  });

  it('correctly merges atomic and reset debug trees', () => {
    const atomicClasses = makeStyles({
      block: { display: 'block' },
    })(options);

    const resetClasses = makeResetStyles({
      margin: 0,
      padding: 0,
    })(options);

    const atomicSequence = findSequenceHash(atomicClasses.block);
    const resetSequence = findResetHash(resetClasses);

    const result = mergeDebugSequence(atomicSequence, resetSequence);

    const debugClassname = getDebugClassNames(DEFINITION_LOOKUP_TABLE[atomicSequence!]);
    expect(result).toMatchObject({
      sequenceHash: expect.stringContaining(atomicSequence! + resetSequence!),
      direction: 'ltr',
      children: expect.arrayContaining([
        expect.objectContaining({
          sequenceHash: atomicSequence,
          debugClassNames: expect.any(Array),
        }),
        expect.objectContaining({
          sequenceHash: resetSequence,
          debugClassNames: expect.any(Array),
        }),
      ]),
      debugClassNames: expect.arrayContaining([...debugClassname, { className: resetSequence }]),
    });
  });
});
