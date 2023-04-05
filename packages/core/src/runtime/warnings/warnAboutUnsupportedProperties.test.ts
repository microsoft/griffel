import { warnAboutUnsupportedProperties } from './warnAboutUnsupportedProperties';
import { logError } from './logError';

jest.mock('./logError', () => ({ logError: jest.fn() }));

it('warnAboutUnresolvedRule', () => {
  warnAboutUnsupportedProperties('flex', 0);

  expect((logError as jest.Mock).mock.calls[0][0]).toMatchInlineSnapshot(`
      "@griffel/react: You are using unsupported shorthand CSS property \\"flex\\". Please check your \\"makeStyles\\" calls, there *should not* be following:
        makeStyles({
          [slot]: { flex: \\"0\\" }
        })

      Learn why CSS shorthands are not supported: https://aka.ms/griffel-css-shorthands"
    `);
});
