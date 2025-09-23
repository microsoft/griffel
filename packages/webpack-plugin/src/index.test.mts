import { describe, it, expect } from 'vitest';
import { GriffelPlugin, createEnhancedResolverFactory } from './index.mjs';

describe('@griffel/webpack-plugin', () => {
  it('should export GriffelPlugin class', () => {
    expect(GriffelPlugin).toBeDefined();
    expect(typeof GriffelPlugin).toBe('function');
    
    // Should be able to instantiate without throwing
    const plugin = new GriffelPlugin();
    expect(plugin).toBeInstanceOf(GriffelPlugin);
  });

  it('should export createEnhancedResolverFactory function', () => {
    expect(createEnhancedResolverFactory).toBeDefined();
    expect(typeof createEnhancedResolverFactory).toBe('function');
    
    // Should be able to call without throwing
    const factory = createEnhancedResolverFactory();
    expect(typeof factory).toBe('function');
  });

  it('should be able to create GriffelPlugin with options', () => {
    const plugin = new GriffelPlugin({
      collectStats: true,
      resolverFactory: createEnhancedResolverFactory(),
    });
    expect(plugin).toBeInstanceOf(GriffelPlugin);
  });
});
