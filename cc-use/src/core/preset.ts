import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Preset } from './types.js';
import { getConfigPaths } from './config-paths.js';
import { kimiPreset } from '../presets/built-in/kimi.js';
import { moonshotPreset } from '../presets/built-in/moonshot.js';
import { openrouterPreset } from '../presets/built-in/openrouter.js';
import { anthropicPreset } from '../presets/built-in/anthropic.js';
import { customPreset } from '../presets/built-in/custom.js';
import { zhipuPreset } from '../presets/built-in/zhipu.js';
import { deepseekPreset } from '../presets/built-in/deepseek.js';
import { minimaxPreset } from '../presets/built-in/minimax.js';
import { xiaomimimoPreset } from '../presets/built-in/xiaomimimo.js';
import { xiaomimimoTokenCnPreset } from '../presets/built-in/xiaomimimo-token-cn.js';
import { qwenPreset } from '../presets/built-in/qwen.js';
import { aliyunBailianPreset } from '../presets/built-in/aliyun-bailian.js';

const BUILT_IN_PRESETS: Preset[] = [openrouterPreset, anthropicPreset, kimiPreset, moonshotPreset, zhipuPreset, deepseekPreset, minimaxPreset, xiaomimimoPreset, xiaomimimoTokenCnPreset, qwenPreset, aliyunBailianPreset, customPreset];

export function getBuiltInPresets(): Preset[] {
  return BUILT_IN_PRESETS;
}

export function getBuiltInPresetById(id: string): Preset | undefined {
  return BUILT_IN_PRESETS.find((p) => p.id === id);
}

export async function getCustomPresets(): Promise<Preset[]> {
  const paths = getConfigPaths();
  if (!existsSync(paths.presets)) {
    return [];
  }
  return [];
}

export async function getAllPresets(): Promise<Preset[]> {
  const custom = await getCustomPresets();
  return [...BUILT_IN_PRESETS, ...custom];
}

export async function loadPreset(id: string): Promise<Preset | undefined> {
  const builtIn = getBuiltInPresetById(id);
  if (builtIn) return builtIn;
  const custom = await getCustomPresets();
  return custom.find((p) => p.id === id);
}
