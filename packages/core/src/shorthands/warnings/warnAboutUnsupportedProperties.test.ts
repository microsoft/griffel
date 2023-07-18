import { warnAboutUnsupportedFunctionValues } from './warnAboutUnsupportedFunctionValues';
import { logError } from './logError';

jest.mock('./logError', () => ({ logError: jest.fn() }));

it('warnAboutUnsupportedFunctionValues', () => {
  warnAboutUnsupportedFunctionValues('padding', '0px 0px');

  expect((logError as jest.Mock).mock.calls[0][0]).toMatchInlineSnapshot(`
    "@griffel/core: You are using unsupported value for the shorthand CSS function (\\"shorthands.padding\\"). Please check your \\"makeStyles\\" calls, there *should not* be following:
      makeStyles({
        [slot]: { ...shorthands.padding(\\"0px 0px\\") }
      })

    API reference: https://griffel.js.org/react/api/shorthands"
  `);
});
