/*
 * @jest-environment node
 */

import { warnAboutUnresolvedRule } from './warnAboutUnresolvedRule';

describe('warnAboutUnresolvedRule', () => {
  it('does not warn in Node', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    warnAboutUnresolvedRule('div', {
      color: 'red',
      ':hover': { color: 'blue' },
    });

    expect(spy).not.toBeCalled();
  });
});
