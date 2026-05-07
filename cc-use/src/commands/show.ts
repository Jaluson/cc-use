import { loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import pc from 'picocolors';

export async function showCommand(profileLabel: string): Promise<void> {
  const profile = await loadProfile(profileLabel);
  if (!profile) {
    throw new Error(`Profile "${profileLabel}" not found`);
  }

  const preset = await loadPreset(profile.preset);

  console.log(pc.bold(`Profile: ${profile.label}`));
  console.log(`  Preset: ${profile.preset}`);
  console.log(`  Version: ${profile.version}`);
  if (profile.configFileName) {
    console.log(`  Config file: ${profile.configFileName}`);
  }
  console.log(pc.bold('Environment:'));
  for (const [key, value] of Object.entries(profile.env)) {
    const isSecret = preset?.env[key]?.secret || false;
    const display = isSecret ? '****' : value;
    console.log(`  ${key}: ${display}`);
  }
}
