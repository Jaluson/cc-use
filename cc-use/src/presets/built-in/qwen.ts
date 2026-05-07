import type { Preset } from '../../core/types.js';

export const qwenPreset: Preset = {
  version: 1,
  id: 'qwen',
  label: 'Qwen (CN)',
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
  recommendedModels: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
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
      value: 'https://dashscope.aliyuncs.com/apps/anthropic',
      description: 'Qwen API base URL',
    },
    ANTHROPIC_AUTH_TOKEN: {
      value: '',
      description: 'Qwen API Key',
      secret: true,
    },
  },
  providerRuntimeSettings: {
    includeCoAuthoredBy: false,
  },
};
