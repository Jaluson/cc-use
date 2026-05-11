import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { getConfigPaths } from './config-paths.js';

export type ConfigKey = 'profile' | 'claudeArgs';

type ConfigValue = string | string[];

export interface AppConfig {
  [key: string]: ConfigValue;
}

const ALLOWED_KEYS: Record<string, { description: string }> = {
  'profile': { description: 'Default profile to use when none specified' },
  'claudeArgs': { description: 'Default arguments to pass through to Claude Code' },
};

function getConfigPath(): string {
  return getConfigPaths().config;
}

export async function loadConfig(): Promise<AppConfig> {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) {
    return {};
  }
  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content) as AppConfig;
  } catch {
    return {};
  }
}

async function saveConfig(config: AppConfig): Promise<void> {
  const configPath = getConfigPath();
  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export function validateKey(key: string): ConfigKey {
  if (!(key in ALLOWED_KEYS)) {
    const valid = Object.keys(ALLOWED_KEYS).join(', ');
    throw new Error(`Unknown config key: "${key}". Valid keys: ${valid}`);
  }
  return key as ConfigKey;
}

export function getConfigDescription(key: string): string {
  return ALLOWED_KEYS[key]?.description ?? '';
}

export function getAllowedKeys(): string[] {
  return Object.keys(ALLOWED_KEYS);
}

export async function getConfigValue(key: string): Promise<ConfigValue | undefined> {
  validateKey(key);
  const config = await loadConfig();
  return config[key];
}

export async function setConfigValue(key: string, value: ConfigValue): Promise<void> {
  validateKey(key);
  const config = await loadConfig();
  config[key] = value;
  await saveConfig(config);
}

export async function deleteConfigValue(key: string): Promise<boolean> {
  validateKey(key);
  const config = await loadConfig();
  if (!(key in config)) {
    return false;
  }
  delete config[key];
  await saveConfig(config);
  return true;
}

export async function listConfig(): Promise<AppConfig> {
  return loadConfig();
}
