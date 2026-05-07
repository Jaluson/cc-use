import type { Preset } from '../../core/types.js';

export const customPreset: Preset = {
  version: 1,
  id: 'custom',
  label: 'Custom (manual)',
  capabilities: {
    'models.discovery': false,
    'auth.apiKey': true,
    'transport.openaiCompatible': true,
  },
  recommendedModels: [],
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
      value: '',
      description: 'API Base URL',
    },
    ANTHROPIC_AUTH_TOKEN: {
      value: '',
      description: 'API Key',
      secret: true,
    },
  },
  providerRuntimeSettings: {
    includeCoAuthoredBy: false,
  },
};
