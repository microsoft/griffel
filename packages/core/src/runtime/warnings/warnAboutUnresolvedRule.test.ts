import { warnAboutUnresolvedRule } from './warnAboutUnresolvedRule';
import { logError } from './logError';

jest.mock('./logError', () => ({ logError: jest.fn() }));

describe('warnAboutUnresolvedRule', () => {
  it('warns on a missing "&"', () => {
    warnAboutUnresolvedRule('div', {
      color: 'red',
      ':hover': { color: 'blue' },
    });

    expect((logError as jest.Mock).mock.calls[0][0]).toMatchInlineSnapshot(`
      "@griffel/react: A rule was not resolved to CSS properly. Please check your \`makeStyles\` or \`makeResetStyles\` calls for following:
        makeStyles({
          [slot]: {
            \\"div\\": {
              \\"color\\": \\"red\\",
              \\":hover\\": {
                \\"color\\": \\"blue\\"
              }
            }
          }
        })

      It looks that you're are using a nested selector, but it is missing an ampersand placeholder where the generated class name should be injected.
      Try to update a property to include it i.e \\"div\\" => \\"&div\\"."
    `);
  });
});
