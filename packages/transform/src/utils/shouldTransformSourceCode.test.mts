import { describe, it, expect } from 'vitest';
import { shouldTransformSourceCode } from './shouldTransformSourceCode.mjs';

describe('shouldTransformSourceCode', () => {
  it('should return false for code without makeStyles', () => {
    const code = 'const x = 1;';
    expect(shouldTransformSourceCode(code)).toBe(false);
  });

  it('should return true for code with makeStyles import and call', () => {
    const code = `
      import { makeStyles } from '@griffel/react';
      const styles = makeStyles({ color: 'red' });
    `;
    expect(shouldTransformSourceCode(code)).toBe(true);
  });

  it('should return true for code with makeResetStyles', () => {
    const code = `
      import { makeResetStyles } from '@griffel/react';
      const styles = makeResetStyles({ margin: 0 });
    `;
    expect(shouldTransformSourceCode(code)).toBe(true);
  });

  it('should return false for code with makeStyles but no griffel import', () => {
    const code = 'const makeStyles = () => {};';
    expect(shouldTransformSourceCode(code)).toBe(false);
  });
});
