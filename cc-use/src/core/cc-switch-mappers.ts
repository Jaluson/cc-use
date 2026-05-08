import type { Profile, Preset } from './types.js';
import { getBuiltInPresetById } from './preset.js';
import type { CcSwitchProvider } from './cc-switch-reader.js';

export interface MappedProfile {
  label: string;
  presetId: string;
  env: Record<string, string>;
}

export function matchPreset(provider: CcSwitchProvider): Preset {
  // 1. Exact match by provider type
  if (provider.providerType && provider.providerType.toLowerCase() !== 'custom') {
    const exact = getBuiltInPresetById(provider.providerType.toLowerCase());
    if (exact) return exact;
  }

  // 2. URL-based match from env.ANTHROPIC_BASE_URL or endpoints
  const url = (provider.env.ANTHROPIC_BASE_URL ?? provider.endpoints[0] ?? '').toLowerCase();
  const urlMappings: Record<string, string> = {
    'openrouter.ai': 'openrouter',
    'deepseek.com': 'deepseek',
    'api.moonshot.cn': 'moonshot',
    'api.baichuan-ai.com': 'kimi',
    'open.bigmodel.cn': 'zhipu',
    'api.minimax.chat': 'minimax',
    'api.xiaomimimo.com': 'xiaomimimo',
    'dashscope.aliyuncs.com': 'qwen',
    'bailian.aliyuncs.com': 'aliyun-bailian',
    'anthropic.com': 'anthropic',
    'kimi.com': 'kimi',
  };

  for (const [domain, presetId] of Object.entries(urlMappings)) {
    if (url.includes(domain)) {
      const preset = getBuiltInPresetById(presetId);
      if (preset) return preset;
    }
  }

  // 3. Fallback to custom
  const custom = getBuiltInPresetById('custom');
  if (custom) return custom;

  throw new Error('Built-in custom preset not found');
}

export function mapProviderToProfile(
  provider: CcSwitchProvider,
): MappedProfile {
  const preset = matchPreset(provider);

  return {
    label: provider.name,
    presetId: preset.id,
    env: { ...provider.env },
  };
}

export function buildProfile(mapped: MappedProfile): Profile {
  const preset = getBuiltInPresetById(mapped.presetId);
  if (!preset) {
    throw new Error(`Preset "${mapped.presetId}" not found`);
  }

  return {
    version: 1,
    preset: mapped.presetId,
    presetVersion: preset.version,
    label: mapped.label,
    env: mapped.env,
  };
}
