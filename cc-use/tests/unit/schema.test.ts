import { describe, it, expect } from 'vitest';
import { validateProfile, validatePreset } from '../../src/core/schema.js';
import type { Preset, Profile } from '../../src/core/types.js';

const validPreset: Preset = {
  version: 1,
  id: 'kimi',
  label: 'Kimi',
  capabilities: { 'models.discovery': true },
  modelRoles: ['default'],
  modelEnvMapping: { default: 'ANTHROPIC_MODEL' },
  env: { ANTHROPIC_BASE_URL: { value: 'https://api.kimi.com' } },
};

const validProfile: Profile = {
  version: 1,
  preset: 'kimi',
  presetVersion: 1,
  label: 'my-kimi',
  env: { ANTHROPIC_BASE_URL: 'https://api.kimi.com' },
};

describe('validateProfile', () => {
  it('should validate correct profile', () => {
    const result = validateProfile(validProfile);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing version', () => {
    const result = validateProfile({ ...validProfile, version: undefined });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'version')).toBe(true);
  });

  it('should reject empty label', () => {
    const result = validateProfile({ ...validProfile, label: '' });
    expect(result.valid).toBe(false);
  });

  it('should reject non-string env values', () => {
    const result = validateProfile({ ...validProfile, env: { KEY: 123 } });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'env.KEY')).toBe(true);
  });

  it('should check required env against preset', () => {
    const preset: Preset = {
      ...validPreset,
      env: { ANTHROPIC_AUTH_TOKEN: { value: '', description: 'Token' } },
    };
    const result = validateProfile(validProfile, preset);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'env.ANTHROPIC_AUTH_TOKEN')).toBe(true);
  });
});

describe('validatePreset', () => {
  it('should validate correct preset', () => {
    const result = validatePreset(validPreset);
    expect(result.valid).toBe(true);
  });

  it('should reject missing id', () => {
    const result = validatePreset({ ...validPreset, id: '' });
    expect(result.valid).toBe(false);
  });

  it('should reject missing modelRoles', () => {
    const result = validatePreset({ ...validPreset, modelRoles: undefined });
    expect(result.valid).toBe(false);
  });
});
