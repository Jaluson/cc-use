import { listProfiles, loadProfile } from '../core/profile.js';
import { loadPreset } from '../core/preset.js';
import { printTable, printEmptyState, printCommandHeader } from '../ui/index.js';
import pc from 'picocolors';

export async function listCommand(): Promise<void> {
  const profiles = await listProfiles();

  if (profiles.length === 0) {
    printEmptyState(
      'No profiles configured yet',
      'Use "cc-use add" to create your first profile',
    );
    return;
  }

  printCommandHeader('Profiles', `${profiles.length} profile(s) configured`);

  const rows = [];
  for (const name of profiles) {
    const profile = await loadProfile(name);
    const preset = profile ? await loadPreset(profile.preset) : undefined;
    const model = profile?.env.ANTHROPIC_MODEL || '';

    rows.push({
      name: pc.white(pc.bold(name)),
      preset: pc.cyan(profile?.preset || '?'),
      label: pc.gray(preset?.label || ''),
      model: model ? pc.dim(model) : pc.gray(pc.dim('—')),
    });
  }

  printTable(
    [
      { key: 'name', header: 'Name', width: 16 },
      { key: 'preset', header: 'Preset', width: 14 },
      { key: 'label', header: 'Provider', width: 20 },
      { key: 'model', header: 'Model', width: 24 },
    ],
    rows,
  );

  console.log();
}
