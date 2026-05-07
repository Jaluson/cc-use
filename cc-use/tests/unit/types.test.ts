import { describe, it, expect } from 'vitest';
import type { Preset, Profile, Metadata } from '../../src/core/types.js';

describe('types', () => {
  it('Preset should accept valid structure', () => {
    const preset: Preset = {
      version: 1,
      id: 'kimi',
      label: 'Moonshot Kimi',
      capabilities: { 'models.discovery': true },
      modelRoles: ['default'],
      modelEnvMapping: { default: 'ANTHROPIC_MODEL' },
      env: {
        ANTHROPIC_BASE_URL: { value: 'https://api.kimi.com/coding/' },
      },
    };
    expect(preset.id).toBe('kimi');
  });

  it('Profile should accept valid structure', () => {
    const profile: Profile = {
      version: 1,
      preset: 'kimi',
      presetVersion: 1,
      label: 'my-kimi',
      env: { ANTHROPIC_MODEL: 'kimi-for-coding' },
    };
    expect(profile.preset).toBe('kimi');
  });

  it('Metadata should accept valid structure', () => {
    const metadata: Metadata = {
      version: 1,
      profile: 'my-kimi',
      preset: 'kimi',
      presetVersion: 1,
      updatedAt: '2026-05-07T00:00:00Z',
      profileChecksum: 'sha256:abc',
      lastManagedEnvKeys: ['ANTHROPIC_MODEL'],
    };
    expect(metadata.profile).toBe('my-kimi');
  });
});
