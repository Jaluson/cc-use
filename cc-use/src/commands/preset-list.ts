import { getBuiltInPresets } from '../core/preset.js';
import { printCommandHeader, printTable } from '../ui/index.js';
import pc from 'picocolors';

export async function presetListCommand(): Promise<void> {
  const presets = getBuiltInPresets();

  printCommandHeader('Built-in Presets', `${presets.length} provider presets available`);

  const rows = presets.map((preset) => {
    const caps = Object.entries(preset.capabilities)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/^.*\./, ''));

    return {
      id: pc.cyan(pc.bold(preset.id)),
      label: pc.white(preset.label),
      version: pc.gray(String(preset.version)),
      capabilities: caps.length > 0 ? pc.dim(caps.join(', ')) : pc.gray(pc.dim('—')),
    };
  });

  printTable(
    [
      { key: 'id', header: 'ID', width: 14 },
      { key: 'label', header: 'Provider', width: 20 },
      { key: 'version', header: 'Ver', width: 6, align: 'center' },
      { key: 'capabilities', header: 'Capabilities', width: 30 },
    ],
    rows,
    { compact: true },
  );

  console.log();
}
