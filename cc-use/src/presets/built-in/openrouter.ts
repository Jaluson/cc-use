import type { Preset } from '../../core/types.js';

export const openrouterPreset: Preset = {
  version: 1,
  id: 'openrouter',
  label: 'OpenRouter',
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
  recommendedModels: ['anthropic/claude-sonnet-4', 'anthropic/claude-opus-4', 'openai/gpt-4o'],
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
      value: 'https://openrouter.ai/api/v1',
      description: 'OpenRouter API base URL',
    },
    ANTHROPIC_AUTH_TOKEN: {
      value: '',
      description: 'OpenRouter API Key',
      secret: true,
    },
  },
  providerRuntimeSettings: {
    includeCoAuthoredBy: false,
  },
};
