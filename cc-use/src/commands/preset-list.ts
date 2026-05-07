import { getBuiltInPresets } from '../core/preset.js';
import pc from 'picocolors';

export async function presetListCommand(): Promise<void> {
  const presets = getBuiltInPresets();
  console.log(pc.bold('Built-in Presets:'));
  for (const preset of presets) {
    const caps = Object.entries(preset.capabilities)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/^.*\./, ''))
      .slice(0, 3)
      .join(', ');
    const line = `  ${preset.id.padEnd(12)} ${preset.label.padEnd(20)} [${caps}]`;
    console.log(line);
  }
}
