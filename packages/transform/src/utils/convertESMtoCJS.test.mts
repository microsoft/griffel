import { describe, expect, it } from 'vitest';
import { convertESMtoCJS } from './convertESMtoCJS.mjs';

describe('convertESMtoCJS', () => {
  it('throws on parse errors', () => {
    const invalidCode = 'for (const key of ) {}';

    expect(() => convertESMtoCJS(invalidCode, '/test.js')).toThrowError(/convertESMtoCJS: failed to parse/);
  });
});
