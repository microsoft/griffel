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
    const resetClassName = makeResetStyles({
      margin: '0',
      padding: '0',
    })(options);
    const className = mergeClasses('ui-button', resetClassName);
    const classNameForLookup = findResetHash(className)!;
    const result = getResetDebugSequence(classNameForLookup)!;
    expect(result).toEqual({
      children: [],
      debugClassNames: [{ className: classNameForLookup }],
      direction: options.dir,
      rules: expect.any(Object),
      sequenceHash: classNameForLookup,
      slot: 'makeResetStyles()',
    });
    expect(result.rules).toMatchInlineSnapshot(`
      Object {
        "r1l95nvm": ".r1l95nvm{margin:0;padding:0;}",
      }
    `);
  });
  it('handles reset styles with nested selectors', () => {
    const resetClassName = makeResetStyles({
      margin: '0',
      padding: '0',
      ':hover': { color: 'blue' },
      '& .foo': { color: 'red' },
    })(options);
    const className = mergeClasses('ui-button', resetClassName);
    const classNameForLookup = findResetHash(className)!;
    const result = getResetDebugSequence(classNameForLookup)!;
    expect(result).toEqual({
      children: [],
      debugClassNames: [{ className: classNameForLookup }],
      direction: options.dir,
      rules: expect.any(Object),
      sequenceHash: classNameForLookup,
      slot: 'makeResetStyles()',
    });
    expect(result.rules).toMatchInlineSnapshot(`
      Object {
        "rf14qlw": ".rf14qlw{margin:0;padding:0;}.rf14qlw:hover{color:blue;}.rf14qlw .foo{color:red;}",
      }
    `);
  });
});
