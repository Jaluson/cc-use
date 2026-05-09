import { loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { printCommandHeader, printKeyValue, printBox, s } from '../ui/index.js';
import { promptProfileSelectionWithInfo } from './_interactive.js';
import pc from 'picocolors';

export async function showCommand(profileLabel: string | undefined): Promise<void> {
  let label = profileLabel;
  if (!label) {
    label = await promptProfileSelectionWithInfo('Select a profile to view:');
    if (!label) return;
  }

  const profile = await loadProfile(label);
  if (!profile) {
    throw new Error(`Profile "${label}" not found`);
  }

  const preset = await loadPreset(profile.preset);

  printCommandHeader('Profile Details');

  const infoItems = [
    { key: 'Label', value: profile.label },
    { key: 'Preset', value: profile.preset },
    { key: 'Version', value: String(profile.version) },
    { key: 'Preset Version', value: String(profile.presetVersion) },
  ];

  if (profile.configFileName) {
    infoItems.push({ key: 'Config File', value: profile.configFileName });
  }

  printKeyValue(infoItems);

  console.log();

  // Environment variables
  const envItems = Object.entries(profile.env).map(([key, value]) => {
    const isSecret = preset?.env[key]?.secret || false;
    return {
      key,
      value: isSecret ? '****' : value,
      secret: isSecret,
    };
  });

  if (envItems.length > 0) {
    console.log(pc.cyan(pc.bold(`${s.chevron} Environment Variables`)));
    console.log(pc.dim('  ' + '─'.repeat(30)));
    printKeyValue(envItems);
  }

  console.log();
}
