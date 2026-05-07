import { describe, it, expect } from 'vitest';
import { sanitizeProfileForExport } from '../../src/core/export.js';
import type { Profile, Preset } from '../../src/core/types.js';

describe('sanitizeProfileForExport', () => {
  const preset: Preset = {
    version: 1,
    id: 'kimi',
    label: 'Kimi',
    capabilities: {},
    modelRoles: ['default'],
    modelEnvMapping: { default: 'ANTHROPIC_MODEL' },
    env: {
      ANTHROPIC_BASE_URL: { value: 'https://api.kimi.com' },
      ANTHROPIC_AUTH_TOKEN: { value: '', secret: true },
    },
  };

  const profile: Profile = {
    version: 1,
    preset: 'kimi',
    presetVersion: 1,
    label: 'my-kimi',
    env: {
      ANTHROPIC_BASE_URL: 'https://api.kimi.com',
      ANTHROPIC_AUTH_TOKEN: 'sk-secret123',
    },
  };

  it('should keep non-secret values', () => {
    const result = sanitizeProfileForExport(profile, preset);
    expect(result.env.ANTHROPIC_BASE_URL).toBe('https://api.kimi.com');
  });

  it('should mask secret values', () => {
    const result = sanitizeProfileForExport(profile, preset);
    expect(result.env.ANTHROPIC_AUTH_TOKEN).toBe('');
  });

  it('should preserve configFileName', () => {
    const withConfig = { ...profile, configFileName: 'custom.json' };
    const result = sanitizeProfileForExport(withConfig, preset);
    expect(result.configFileName).toBe('custom.json');
  });
});
