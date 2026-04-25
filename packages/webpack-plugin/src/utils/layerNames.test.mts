import { describe, it, expect } from 'vitest';
import {
  bucketLayerName,
  mediaPlaceholder,
  containerPlaceholder,
  hashOfQuery,
  GRIFFEL_LAYER_NAMESPACE,
} from './layerNames.mjs';

describe('layerNames', () => {
  it('builds bucket layer names without priority', () => {
    expect(bucketLayerName('d')).toBe('griffel.d');
    expect(bucketLayerName('h')).toBe('griffel.h');
  });

  it('encodes priority via the .s<n> sub-layer when non-zero', () => {
    expect(bucketLayerName('d', -1)).toBe('griffel.d.s-1');
    expect(bucketLayerName('d', -2)).toBe('griffel.d.s-2');
    expect(bucketLayerName('d', 0)).toBe('griffel.d');
  });

  it('produces a stable hash for the same query string', () => {
    expect(hashOfQuery('(min-width: 800px)')).toBe(hashOfQuery('(min-width: 800px)'));
    expect(hashOfQuery('(min-width: 800px)')).not.toBe(hashOfQuery('(min-width: 1200px)'));
  });

  it('mediaPlaceholder produces a valid CSS ident', () => {
    const ident = mediaPlaceholder('(min-width: 800px)');
    expect(ident).toMatch(/^griffel\.m\.__griffelmq_[a-z0-9]+__$/);
  });

  it('containerPlaceholder uses a distinct prefix', () => {
    const ident = containerPlaceholder('(width > 600px)');
    expect(ident).toMatch(/^griffel\.c\.__griffelcq_[a-z0-9]+__$/);
  });

  it('GRIFFEL_LAYER_NAMESPACE is the namespace for declarations', () => {
    expect(GRIFFEL_LAYER_NAMESPACE).toBe('griffel');
  });
});
