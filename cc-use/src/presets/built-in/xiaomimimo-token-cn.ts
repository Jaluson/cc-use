import type { Preset } from '../../core/types.js';

export const xiaomimimoTokenCnPreset: Preset = {
  version: 1,
  id: 'xiaomimimo-token-cn',
  label: 'Xiaomi MiMo Token Plan (CN)',
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
  recommendedModels: ['mimo-latest'],
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
      value: 'https://token-plan-cn.xiaomimimo.com/anthropic',
      description: 'Xiaomi MiMo Token Plan CN API base URL',
    },
    ANTHROPIC_AUTH_TOKEN: {
      value: '',
      description: 'Xiaomi MiMo Token Plan CN API Key',
      secret: true,
    },
  },
  providerRuntimeSettings: {
    includeCoAuthoredBy: false,
  },
};
