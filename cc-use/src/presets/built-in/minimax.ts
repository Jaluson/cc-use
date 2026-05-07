import type { Preset } from '../../core/types.js';

export const minimaxPreset: Preset = {
  version: 1,
  id: 'minimax',
  label: 'MiniMax (CN)',
  capabilities: {
    'models.discovery': true,
    'models.reasoning': true,
    'auth.apiKey': true,
    'transport.openaiCompatible': true,
  },
  modelDiscovery: {
    endpoint: '/v1/models',
    responsePath: 'data',
    idField: 'id',
  },
  recommendedModels: ['MiniMax-Text-01'],
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
      value: 'https://api.minimaxi.com/anthropic',
      description: 'MiniMax API base URL',
    },
    ANTHROPIC_AUTH_TOKEN: {
      value: '',
      description: 'MiniMax API Key',
      secret: true,
    },
  },
  providerRuntimeSettings: {
    includeCoAuthoredBy: false,
  },
};
