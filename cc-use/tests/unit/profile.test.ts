import { describe, it, expect } from 'vitest';
import type { Profile } from '../../src/core/types.js';

// Profile tests need a real filesystem, so we test via the module
// but override the config home via environment variable
const originalEnv = process.env.XDG_CONFIG_HOME;

describe('profile', () => {
  const testProfile: Profile = {
    version: 1,
    preset: 'kimi',
    presetVersion: 1,
    label: 'test-profile',
    env: { ANTHROPIC_MODEL: 'kimi-for-coding' },
  };

  it('should import profile module', async () => {
    const { saveProfile, loadProfile } = await import('../../src/core/profile.js');
    expect(typeof saveProfile).toBe('function');
    expect(typeof loadProfile).toBe('function');
  });

  it('should save and load profile', async () => {
    const { saveProfile, loadProfile } = await import('../../src/core/profile.js');
    await saveProfile(testProfile);
    const loaded = await loadProfile('test-profile');
    expect(loaded).toBeDefined();
    expect(loaded?.label).toBe('test-profile');
  });

  it('should list profiles', async () => {
    const { saveProfile, listProfiles } = await import('../../src/core/profile.js');
    await saveProfile(testProfile);
    const profiles = await listProfiles();
    expect(profiles).toContain('test-profile');
  });

  it('should check profile existence', async () => {
    const { saveProfile, profileExists } = await import('../../src/core/profile.js');
    await saveProfile(testProfile);
    expect(await profileExists('test-profile')).toBe(true);
    expect(await profileExists('nonexistent')).toBe(false);
  });

  it('should delete profile', async () => {
    const { saveProfile, deleteProfile, loadProfile } = await import('../../src/core/profile.js');
    await saveProfile(testProfile);
    expect(await deleteProfile('test-profile')).toBe(true);
    expect(await loadProfile('test-profile')).toBeUndefined();
  });

  it('should suggest similar profile names', async () => {
    const { findSimilarProfiles } = await import('../../src/core/profile.js');
    const candidates = ['kimi', 'work', 'personal'];
    const result = await findSimilarProfiles('kimii', candidates);
    expect(result).toContain('kimi');
  });

  it('should return empty for very different names', async () => {
    const { findSimilarProfiles } = await import('../../src/core/profile.js');
    const candidates = ['kimi', 'work'];
    const result = await findSimilarProfiles('xyzabc', candidates);
    expect(result).toHaveLength(0);
  });
});
