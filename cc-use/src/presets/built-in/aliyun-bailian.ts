import type { Preset } from '../../core/types.js';

export const aliyunBailianPreset: Preset = {
  version: 1,
  id: 'aliyun-bailian',
  label: 'Aliyun Bailian Token Plan (CN)',
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
  recommendedModels: ['qwen-max', 'qwen-plus'],
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
      value: 'https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic',
      description: 'Aliyun Bailian Token Plan API base URL',
    },
    ANTHROPIC_AUTH_TOKEN: {
      value: '',
      description: 'Aliyun Bailian API Key',
      secret: true,
    },
  },
  providerRuntimeSettings: {
    includeCoAuthoredBy: false,
  },
};
