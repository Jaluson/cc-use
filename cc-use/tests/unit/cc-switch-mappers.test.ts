import { describe, it, expect } from 'vitest';
import {
  matchPreset,
  mapProviderToProfile,
} from '../../src/core/cc-switch-mappers.js';
import type { CcSwitchProvider } from '../../src/core/cc-switch-reader.js';

describe('cc-switch-mappers', () => {
  const createProvider = (
    overrides: Partial<CcSwitchProvider> = {},
  ): CcSwitchProvider => ({
    id: 'default',
    name: 'Test Provider',
    env: {
      ANTHROPIC_API_KEY: 'sk-test-key',
      ANTHROPIC_BASE_URL: 'https://api.example.com',
    },
    providerType: 'custom',
    endpoints: [],
    ...overrides,
  });

  describe('matchPreset', () => {
    it('should match by provider type exactly', () => {
      const provider = createProvider({ providerType: 'openrouter' });
      const preset = matchPreset(provider);
      expect(preset.id).toBe('openrouter');
    });

    it('should match by base URL in env', () => {
      const provider = createProvider({
        providerType: 'custom',
        env: {
          ANTHROPIC_BASE_URL: 'https://openrouter.ai/api/v1',
        },
      });
      const preset = matchPreset(provider);
      expect(preset.id).toBe('openrouter');
    });

    it('should match by endpoint URL', () => {
      const provider = createProvider({
        providerType: 'custom',
        env: {},
        endpoints: ['https://api.deepseek.com/anthropic'],
      });
      const preset = matchPreset(provider);
      expect(preset.id).toBe('deepseek');
    });

    it('should fallback to custom preset', () => {
      const provider = createProvider({
        providerType: 'unknown',
        env: { ANTHROPIC_BASE_URL: 'https://unknown.com' },
      });
      const preset = matchPreset(provider);
      expect(preset.id).toBe('custom');
    });
  });

  describe('mapProviderToProfile', () => {
    it('should map openrouter provider correctly', () => {
      const provider = createProvider({
        name: 'My OpenRouter',
        providerType: 'openrouter',
        env: {
          OPENROUTER_API_KEY: 'sk-or-v1-test',
          OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
        },
      });
      const mapped = mapProviderToProfile(provider);
      expect(mapped.label).toBe('My OpenRouter');
      expect(mapped.presetId).toBe('openrouter');
      expect(mapped.env.OPENROUTER_API_KEY).toBe('sk-or-v1-test');
      expect(mapped.env.OPENROUTER_BASE_URL).toBe(
        'https://openrouter.ai/api/v1',
      );
    });

    it('should map deepseek provider correctly', () => {
      const provider = createProvider({
        name: 'DeepSeek',
        providerType: 'deepseek',
        env: {
          ANTHROPIC_AUTH_TOKEN: 'sk-deepseek-test',
          ANTHROPIC_BASE_URL: 'https://api.deepseek.com/anthropic',
        },
      });
      const mapped = mapProviderToProfile(provider);
      expect(mapped.presetId).toBe('deepseek');
      expect(mapped.env.ANTHROPIC_AUTH_TOKEN).toBe('sk-deepseek-test');
      expect(mapped.env.ANTHROPIC_BASE_URL).toBe(
        'https://api.deepseek.com/anthropic',
      );
    });

    it('should preserve all env vars from provider', () => {
      const provider = createProvider({
        env: {
          ANTHROPIC_API_KEY: 'key',
          ANTHROPIC_BASE_URL: 'url',
          ANTHROPIC_MODEL: 'model',
        },
      });
      const mapped = mapProviderToProfile(provider);
      expect(Object.keys(mapped.env)).toHaveLength(3);
      expect(mapped.env.ANTHROPIC_MODEL).toBe('model');
    });
  });
});
