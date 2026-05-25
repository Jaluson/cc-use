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

// Environment variables are stored separately under a special key
const ENV_KEY = '_env';

export async function getEnvConfig(): Promise<Record<string, string>> {
  const config = await loadConfig();
  const envConfig = config[ENV_KEY];
  if (typeof envConfig === 'object' && envConfig !== null && !Array.isArray(envConfig)) {
    return envConfig as Record<string, string>;
  }
  return {};
}

export async function setEnvValue(key: string, value: string): Promise<void> {
  if (!key.match(/^[A-Za-z_][A-Za-z0-9_]*$/)) {
    throw new Error(`Invalid environment variable name: "${key}"`);
  }
  const env = await getEnvConfig();
  env[key] = value;
  const config = await loadConfig();
  config[ENV_KEY] = env;
  await saveConfig(config);
}

export async function deleteEnvValue(key: string): Promise<boolean> {
  const env = await getEnvConfig();
  if (!(key in env)) {
    return false;
  }
  delete env[key];
  const config = await loadConfig();
  config[ENV_KEY] = env;
  await saveConfig(config);
  return true;
}

// Settings overrides are stored separately
const SETTINGS_KEY = '_settings';

export interface SettingsOverride {
  [key: string]: unknown;
}

export async function getSettingsConfig(): Promise<SettingsOverride> {
  const config = await loadConfig();
  const settingsConfig = config[SETTINGS_KEY];
  if (typeof settingsConfig === 'object' && settingsConfig !== null && !Array.isArray(settingsConfig)) {
    return settingsConfig as SettingsOverride;
  }
  return {};
}

export async function setSettingsValue(key: string, value: unknown): Promise<void> {
  if (!key.match(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/)) {
    throw new Error(`Invalid settings key: "${key}"`);
  }
  const settings = await getSettingsConfig();

  // Support nested keys using dot notation
  if (key.includes('.')) {
    const parts = key.split('.');
    let current: Record<string, unknown> = settings as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  } else {
    settings[key] = value;
  }

  const config = await loadConfig();
  config[SETTINGS_KEY] = settings;
  await saveConfig(config);
}

export async function deleteSettingsValue(key: string): Promise<boolean> {
  const settings = await getSettingsConfig();

  // Support nested keys using dot notation
  if (key.includes('.')) {
    const parts = key.split('.');
    let current: Record<string, unknown> = settings as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== 'object') {
        return false;
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    if (!(parts[parts.length - 1] in current)) {
      return false;
    }
    delete current[parts[parts.length - 1]];
  } else {
    if (!(key in settings)) {
      return false;
    }
    delete settings[key];
  }

  const config = await loadConfig();
  config[SETTINGS_KEY] = settings;
  await saveConfig(config);
  return true;
}
