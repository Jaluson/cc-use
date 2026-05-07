import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Profile, Preset, SettingsJson, Metadata } from './types.js';

export interface RenderResult {
  settings: SettingsJson;
  managedEnvKeys: string[];
}

export async function renderSettings(
  profile: Profile,
  preset: Preset,
  cwd: string = process.cwd(),
): Promise<RenderResult> {
  const settingsPath = join(cwd, '.claude', 'settings.json');
  let existing: SettingsJson = {};

  if (existsSync(settingsPath)) {
    const content = await readFile(settingsPath, 'utf-8');
    existing = JSON.parse(content) as SettingsJson;
  }

  const result: SettingsJson = { ...existing };

  // Clean up old managed env keys via metadata
  const metadataPath = join(cwd, '.claude', 'cc-use.json');
  if (existsSync(metadataPath)) {
    const metaContent = await readFile(metadataPath, 'utf-8');
    const meta = JSON.parse(metaContent) as Metadata;
    if (meta.lastManagedEnvKeys && result.env) {
      for (const key of meta.lastManagedEnvKeys) {
        delete result.env[key];
      }
    }
  }

  // Write new managed env keys
  const managedEnvKeys = Object.keys(profile.env);
  result.env = { ...result.env, ...profile.env };

  // Write providerRuntimeSettings allowlist
  if (preset.providerRuntimeSettings) {
    for (const [key, value] of Object.entries(preset.providerRuntimeSettings)) {
      result[key] = value;
    }
  }

  return { settings: result, managedEnvKeys };
}
