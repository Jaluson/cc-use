import { listProfiles, loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import pc from 'picocolors';

export async function listCommand(): Promise<void> {
  const profiles = await listProfiles();
  if (profiles.length === 0) {
    console.log(pc.yellow('No profiles found'));
    return;
  }

  console.log(pc.bold('Profiles:'));
  for (const name of profiles) {
    const profile = await loadProfile(name);
    const preset = profile ? await loadPreset(profile.preset) : undefined;
    const model = profile?.env.ANTHROPIC_MODEL || '';
    const line = `  ${name.padEnd(12)} ${(`(${profile?.preset || '?'})`).padEnd(14)} ${model}`;
    console.log(line);
  }
}
