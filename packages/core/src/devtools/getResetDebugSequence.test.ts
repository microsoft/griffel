import { RESET_HASH_PREFIX } from '../constants';
import { makeResetStyles } from '../makeResetStyles';
import type { MakeStylesOptions } from '../makeStyles';
import { mergeClasses } from '../mergeClasses';
import { createDOMRenderer } from '../renderer/createDOMRenderer';
import { getResetDebugSequence } from './getResetDebugSequence';

jest.mock('./isDevToolsEnabled', () => ({
  isDevToolsEnabled: true,
}));

const options: MakeStylesOptions = {
  dir: 'ltr',
  renderer: createDOMRenderer(document),
};

const findResetHash = (classNames: string) =>
  classNames.split(' ').find(className => className.startsWith(RESET_HASH_PREFIX));

describe('getResetDebugSequence', () => {
  it('returns correct debug tree for reset styles', () => {
    const classes = makeResetStyles({
      margin: '0',
      padding: '0',
      boxSizing: 'border-box',
    })(options);

    const className = mergeClasses('ui-button', classes);
    const resetClassName = findResetHash(className);

    expect(getResetDebugSequence(resetClassName!)).toEqual({
      children: [],
      debugClassNames: [
        {
          className: resetClassName,
        },
      ],
      direction: 'ltr',
      rules: {
        [resetClassName!]: expect.stringContaining('margin:0'), // Match partial rule content
      },
      sequenceHash: resetClassName,
      slot: resetClassName,
    });
  });

  it('handles reset styles with multiple properties', () => {
    const classes = makeResetStyles({
      margin: '0',
      padding: '0',
      border: 'none',
      background: 'none',
      fontSize: '100%',
    })(options);

    const className = mergeClasses('ui-button', classes);
    const resetClassName = findResetHash(className);

    expect(getResetDebugSequence(resetClassName!)).toEqual({
      children: [],
      debugClassNames: [
        {
          className: resetClassName,
        },
      ],
      direction: 'ltr',
      rules: {
        [resetClassName!]: expect.stringMatching(/margin:0.*padding:0.*border:none/),
      },
      sequenceHash: resetClassName,
      slot: resetClassName,
    });
  });
});
