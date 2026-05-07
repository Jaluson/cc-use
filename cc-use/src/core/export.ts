import type { Profile, Preset } from './types.js';

export interface ExportableProfile {
  version: number;
  preset: string;
  presetVersion: number;
  label: string;
  env: Record<string, string>;
  configFileName?: string;
}

export function sanitizeProfileForExport(profile: Profile, preset: Preset): ExportableProfile {
  const env: Record<string, string> = {};

  for (const [key, value] of Object.entries(profile.env)) {
    const template = preset.env[key];
    if (template?.secret) {
      env[key] = '';
    } else {
      env[key] = value;
    }
  }

  return {
    version: profile.version,
    preset: profile.preset,
    presetVersion: profile.presetVersion,
    label: profile.label,
    env,
    ...(profile.configFileName ? { configFileName: profile.configFileName } : {}),
  };
}
