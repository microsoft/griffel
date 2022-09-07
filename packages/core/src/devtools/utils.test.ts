import type { LookupItem } from '../types';
import type { DebugSequence } from './types';
import { getDebugClassNames } from './utils';

describe('getDebugClassNames', () => {
  it('handles no parent debug node', () => {
    const lookupItem: LookupItem = [
      {
        De3pzq: 'f3xbvq9',
      },
      'ltr',
    ];
    expect(getDebugClassNames(lookupItem)).toEqual([
      {
        className: 'f3xbvq9',
        overriddenBy: undefined,
      },
    ]);
  });

  it('handles parent debug node does not contain overriding style', () => {
    const lookupItem: LookupItem = [
      {
        De3pzq: 'f3xbvq9',
      },
      'ltr',
    ];
    const parentLookupItem: LookupItem = [...lookupItem];
    const parentDebugClassNames = [{ className: 'f3xbvq9', overriddenBy: undefined }];
    expect(getDebugClassNames(lookupItem, parentLookupItem, parentDebugClassNames)).toEqual([
      {
        className: 'f3xbvq9',
        overriddenBy: undefined,
      },
    ]);
  });

  it('handles parent debug node contains overriding style', () => {
    const lookupItem: LookupItem = [
      {
        De3pzq: 'fdmssx0',
      },
      'ltr',
    ];
    const parentLookupItem: LookupItem = [
      {
        De3pzq: 'f3xbvq9',
      },
      'ltr',
    ];
    const parentDebugClassNames = [{ className: 'f3xbvq9', overriddenBy: undefined }];
    expect(getDebugClassNames(lookupItem, parentLookupItem, parentDebugClassNames)).toEqual([
      {
        className: 'fdmssx0',
        overriddenBy: 'f3xbvq9',
      },
    ]);
  });

  it('handles when higher level ancestor debug node contains overriding style', () => {
    const lookupItem: LookupItem = [
      {
        De3pzq: 'fdmssx0',
      },
      'ltr',
    ];
    const parentLookupItem: LookupItem = [...lookupItem];
    const parentDebugClassNames = [{ className: 'fdmssx0', overriddenBy: 'f3xbvq9' }];
    expect(getDebugClassNames(lookupItem, parentLookupItem, parentDebugClassNames)).toEqual([
      {
        className: 'fdmssx0',
        overriddenBy: 'f3xbvq9',
      },
    ]);
  });

  it('handles parent debug node contains overriding style, but the overriding rule is the same', () => {
    const lookupItem: LookupItem = [
      {
        De3pzq: 'fdmssx0',
      },
      'ltr',
    ];
    const parentLookupItem: LookupItem = [
      {
        De3pzq: 'fdmssx0',
      },
      'ltr',
    ];
    const parentDebugClassNames = [{ className: 'fdmssx0', overriddenBy: undefined }];
    const overridingSiblings: DebugSequence[] = [
      {
        sequenceHash: '___1abcdef_1abcdef',
        direction: 'ltr',
        children: [],
        debugClassNames: [{ className: 'fdmssx0' }],
      },
    ];
    expect(getDebugClassNames(lookupItem, parentLookupItem, parentDebugClassNames, overridingSiblings)).toEqual([
      {
        className: 'fdmssx0',
        overriddenBy: 'fdmssx0',
      },
    ]);
  });
});
