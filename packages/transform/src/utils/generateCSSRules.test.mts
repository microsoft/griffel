import { describe, it, expect } from 'vitest';
import { generateCSSRules } from './generateCSSRules.mjs';

describe('generateCSSRules', () => {
  it('should generate CSS from simple bucket entries', () => {
    const cssRulesByBucket = {
      d: ['.a{color:red;}', '.b{color:blue;}'],
    };

    const result = generateCSSRules(cssRulesByBucket);
    expect(result).toBe('.a{color:red;}.b{color:blue;}');
  });

  it('should handle array entries with metadata', () => {
    const cssRulesByBucket = {
      d: ['.a{color:red;}', ['.b{padding:10px;}', { p: -1 }]],
    };

    const result = generateCSSRules(cssRulesByBucket);
    expect(result).toBe('.a{color:red;}.b{padding:10px;}');
  });

  it('should process buckets in correct order', () => {
    const cssRulesByBucket = {
      m: ['.media{color:red;}'],
      d: ['.default{color:blue;}'],
      h: ['.hover{color:green;}'],
    };

    const result = generateCSSRules(cssRulesByBucket);
    expect(result).toBe('.default{color:blue;}.hover{color:green;}.media{color:red;}');
  });

  it('should return empty string for empty bucket', () => {
    const result = generateCSSRules({});
    expect(result).toBe('');
  });
});
