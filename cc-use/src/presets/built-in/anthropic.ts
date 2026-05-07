import type { Preset } from '../../core/types.js';

export const anthropicPreset: Preset = {
  version: 1,
  id: 'anthropic',
  label: 'Anthropic',
  capabilities: {
    'models.discovery': false,
    'models.reasoning': true,
    'auth.apiKey': true,
    'transport.anthropic': true,
  },
  recommendedModels: ['claude-sonnet-4-6', 'claude-opus-4-7', 'claude-haiku-4-5'],
  modelRoles: ['default', 'haiku', 'sonnet', 'opus', 'reasoning'],
  modelEnvMapping: {
    default: 'ANTHROPIC_MODEL',
    haiku: 'ANTHROPIC_DEFAULT_HAIKU_MODEL',
    sonnet: 'ANTHROPIC_DEFAULT_SONNET_MODEL',
    opus: 'ANTHROPIC_DEFAULT_OPUS_MODEL',
    reasoning: 'ANTHROPIC_REASONING_MODEL',
  },
  env: {
    ANTHROPIC_BASE_URL: {
      value: 'https://api.anthropic.com',
      description: 'Anthropic API base URL',
    },
    ANTHROPIC_AUTH_TOKEN: {
      value: '',
      description: 'Anthropic API Key',
      secret: true,
    },
  },
  providerRuntimeSettings: {
    includeCoAuthoredBy: false,
  },
};
