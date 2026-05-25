import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Profile, Preset, SettingsJson, Metadata } from './types.js';
import { getSettingsConfig, getEnvConfig } from './config.js';

export interface RenderResult {
  settings: SettingsJson;
  managedEnvKeys: string[];
}

export async function renderSettings(
  profile: Profile,
  preset: Preset,
  cwd: string = process.cwd(),
  configFileName: string = 'settings.json',
): Promise<RenderResult> {
  const settingsPath = join(cwd, '.claude', configFileName);
  let existing: SettingsJson = {};

  if (existsSync(settingsPath)) {
    try {
      const content = await readFile(settingsPath, 'utf-8');
      existing = JSON.parse(content) as SettingsJson;
    } catch {
      console.warn(`Warning: ${settingsPath} is invalid JSON, starting fresh`);
      existing = {};
    }
  }

  const result: SettingsJson = { ...existing };

  // Clean up old managed env keys via metadata
  const metadataPath = join(cwd, '.claude', 'cc-use.json');
  if (existsSync(metadataPath)) {
    try {
      const metaContent = await readFile(metadataPath, 'utf-8');
      const meta = JSON.parse(metaContent) as Metadata;
      if (meta.lastManagedEnvKeys && result.env) {
        for (const key of meta.lastManagedEnvKeys) {
          delete result.env[key];
        }
      }
    } catch {
      // Ignore corrupted metadata, will overwrite anyway
    }
  }

  const managedEnvKeys = Object.keys(profile.env);

  // Merge user-configured environment variables from cc-use config env
  const userEnvConfig = await getEnvConfig();

  // Build the env field: profile env takes priority, then user env config
  const finalEnv = { ...userEnvConfig, ...profile.env };

  // Ensure result.env exists
  if (!result.env) {
    result.env = {};
  }

  // Merge with existing env, final order: existing -> user config -> profile
  result.env = { ...result.env, ...finalEnv };

  if (preset.providerRuntimeSettings) {
    for (const [key, value] of Object.entries(preset.providerRuntimeSettings)) {
      result[key] = value;
    }
  }

  // Merge user-configured settings overrides
  const settingsOverrides = await getSettingsConfig();
  for (const [key, value] of Object.entries(settingsOverrides)) {
    result[key] = value as never;
  }

  return { settings: result, managedEnvKeys };
}
