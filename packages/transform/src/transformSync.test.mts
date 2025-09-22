import { describe, it, expect } from 'vitest';

import { transformSync } from './transformSync.mjs';

describe('transformSync', () => {
  it('should return untransformed code when no griffel imports are present', () => {
    const sourceCode = `
      const styles = {
        color: 'red'
      };
    `;

    const result = transformSync(sourceCode, {
      filename: 'test.js',
    });

    expect(result.usedProcessing).toBe(false);
    expect(result.usedVMForEvaluation).toBe(false);
    expect(result.code).toBe(sourceCode);
  });

  it('should transform makeStyles call', () => {
    const sourceCode = `
      import { makeStyles } from '@griffel/react';
      
      const useStyles = makeStyles({
        root: {
          color: 'red'
        }
      });
    `;

    const result = transformSync(sourceCode, {
      filename: 'test.js',
    });

    expect(result.usedProcessing).toBe(true);
    expect(result.cssRulesByBucket).toBeDefined();
    expect(result.code).toContain('__css');
    expect(result.code).not.toContain('makeStyles');
  });

  it('should transform makeResetStyles call', () => {
    const sourceCode = `
      import { makeResetStyles } from '@griffel/react';
      
      const useResetStyles = makeResetStyles({
        margin: 0,
        padding: 0
      });
    `;

    const result = transformSync(sourceCode, {
      filename: 'test.js',
    });

    expect(result.usedProcessing).toBe(true);
    expect(result.cssRulesByBucket).toBeDefined();
    expect(result.code).toContain('__resetCSS');
    expect(result.code).not.toContain('makeResetStyles');
  });

  it('should handle multiple makeStyles calls', () => {
    const sourceCode = `
      import { makeStyles } from '@griffel/react';
      
      const useStyles1 = makeStyles({
        root: { color: 'red' }
      });
      
      const useStyles2 = makeStyles({
        button: { backgroundColor: 'blue' }
      });
    `;

    const result = transformSync(sourceCode, {
      filename: 'test.js',
    });

    expect(result.usedProcessing).toBe(true);
    expect(result.cssRulesByBucket).toBeDefined();
    expect(result.code).toContain('__css');
    expect(result.code).not.toContain('makeStyles');
  });

  it('should generate CSS rules with correct bucket structure', () => {
    const sourceCode = `
      import { makeStyles } from '@griffel/react';
      
      const useStyles = makeStyles({
        root: {
          color: 'red',
          backgroundColor: 'blue',
          ':hover': {
            color: 'green'
          }
        }
      });
    `;

    const result = transformSync(sourceCode, {
      filename: 'test.js',
    });

    expect(result.cssRulesByBucket).toBeDefined();
    expect(result.cssRulesByBucket!.d).toBeDefined(); // default styles
    expect(result.cssRulesByBucket!.h).toBeDefined(); // hover styles
  });

  it('should handle classNameHashSalt option', () => {
    const sourceCode = `
      import { makeStyles } from '@griffel/react';
      
      const useStyles = makeStyles({
        root: { color: 'red' }
      });
    `;

    const result = transformSync(sourceCode, {
      filename: 'test.js',
      classNameHashSalt: 'test-salt',
    });

    expect(result.usedProcessing).toBe(true);
    expect(result.cssRulesByBucket).toBeDefined();
  });
});
