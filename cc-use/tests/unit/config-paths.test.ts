import { describe, it, expect } from 'vitest';
import { getConfigPaths } from '../../src/core/config-paths.js';

describe('config-paths', () => {
  it('should return paths with correct structure', () => {
    const paths = getConfigPaths();
    expect(paths.home).toBeTruthy();
    expect(paths.profiles).toContain('profiles');
    expect(paths.presets).toContain('presets');
    expect(paths.config).toContain('config.json');
  });

  it('should return consistent paths', () => {
    const a = getConfigPaths();
    const b = getConfigPaths();
    expect(a.home).toBe(b.home);
  });
});
