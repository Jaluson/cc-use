import { getBuiltInPresets } from '../core/preset.js';
import pc from 'picocolors';

export async function presetListCommand(): Promise<void> {
  const presets = getBuiltInPresets();
  console.log(pc.bold('Built-in Presets:'));
  for (const preset of presets) {
    console.log(`  ${preset.id} - ${preset.label}`);
  }
}
