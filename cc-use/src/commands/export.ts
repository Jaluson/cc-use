import pc from 'picocolors';
import { loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { sanitizeProfileForExport } from '../core/export.js';
import { writeFile } from 'node:fs/promises';

export async function exportCommand(
  profileLabel: string,
  options: { output?: string } = {},
): Promise<void> {
  const profile = await loadProfile(profileLabel);
  if (!profile) {
    throw new Error(`Profile "${profileLabel}" not found`);
  }

  const preset = await loadPreset(profile.preset);
  if (!preset) {
    throw new Error(`Preset "${profile.preset}" not found`);
  }

  const exportable = sanitizeProfileForExport(profile, preset);
  const json = JSON.stringify(exportable, null, 2);

  if (options.output) {
    await writeFile(options.output, json, 'utf-8');
    console.log(pc.green(`✓ Exported to ${options.output}`));
  } else {
    console.log(json);
  }
}
